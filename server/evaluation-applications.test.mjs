import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createApplicationServer, readConfiguration, validateApplication } from './evaluation-applications.mjs';

const application = {
  teamName: 'Example Research Team',
  organization: 'Example University',
  modelName: 'Example Value Model v1',
  email: 'team@example.org',
  contactMethod: 'wechat',
  contactValue: 'example_team',
};
const { contactMethod, contactValue, ...baseApplication } = application;
const multiContactApplication = {
  ...baseApplication,
  contacts: { phone: '+86 13800138000', wechat: 'example_team', discord: 'example.team_1' },
};

async function fixture(t, { brokenStorage = false } = {}) {
  const temporaryDir = await mkdtemp(join(tmpdir(), 'robovalue-eval-test-'));
  const storageDir = join(temporaryDir, 'submissions');
  if (brokenStorage) await writeFile(storageDir, 'Storage is a file, not a directory.');
  const server = createApplicationServer({ storageDir });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await rm(temporaryDir, { recursive: true, force: true });
  });
  const submit = (payload = application, overrides = {}) => fetch(`${baseUrl}/api/evaluation-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify(payload),
    ...overrides,
  });
  return { storageDir, baseUrl, submit };
}

test('successful submissions are fully saved, private, and return only a receipt', async t => {
  const { submit, storageDir } = await fixture(t);
  const response = await submit({ ...application, teamName: '  Example Research Team  ' });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const receipt = await response.json();
  assert.deepEqual(Object.keys(receipt).sort(), ['applicationId', 'submittedAt']);
  assert.match(receipt.applicationId, /^[0-9a-f-]{36}$/);
  assert.ok(Number.isFinite(Date.parse(receipt.submittedAt)));
  assert.deepEqual(await readdir(storageDir), [`${receipt.applicationId}.json`]);
  const filename = join(storageDir, `${receipt.applicationId}.json`);
  assert.deepEqual(JSON.parse(await readFile(filename, 'utf8')), { ...receipt, ...application });
  assert.equal((await stat(filename)).mode & 0o777, 0o600);
  assert.equal((await stat(storageDir)).mode & 0o777, 0o700);
});

test('all contact methods are accepted with the agreed field limits', () => {
  for (const [contactMethod, contactValue] of [['wechat', 'wxid_example'], ['phone', '+86 (138) 0013-8000'], ['discord', 'example.team_1']]) {
    assert.equal(validateApplication({ ...application, contactMethod, contactValue }).contactValue, contactValue);
  }
  assert.equal(validateApplication({ ...application, teamName: 'T'.repeat(120), organization: 'O'.repeat(160), modelName: 'M'.repeat(160) }).teamName.length, 120);
});

test('multiple contact details are all validated and saved in one record', async t => {
  const { submit, storageDir } = await fixture(t);
  const response = await submit(multiContactApplication);
  assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.deepEqual(Object.keys(receipt).sort(), ['applicationId', 'submittedAt']);
  const saved = JSON.parse(await readFile(join(storageDir, `${receipt.applicationId}.json`), 'utf8'));
  assert.deepEqual(saved, { ...receipt, ...multiContactApplication });
  assert.equal(Object.hasOwn(saved, 'contactMethod'), false);
  assert.equal(Object.hasOwn(saved, 'contactValue'), false);
});

test('blank contacts are omitted and supplied values are trimmed before saving', async t => {
  const { submit, storageDir } = await fixture(t);
  const response = await submit({ ...baseApplication, contacts: { phone: '  ', wechat: '  example_team  ', discord: '' } });
  assert.equal(response.status, 201);
  const receipt = await response.json();
  const saved = JSON.parse(await readFile(join(storageDir, `${receipt.applicationId}.json`), 'utf8'));
  assert.deepEqual(saved.contacts, { wechat: 'example_team' });
  assert.deepEqual(validateApplication({ ...baseApplication, contacts: { discord: 'example.team_1' } }).contacts, { discord: 'example.team_1' });
});

test('no contact details and any invalid supplementary contact reject the entire application', async t => {
  const { submit, storageDir } = await fixture(t);
  const contactSets = [
    {},
    { phone: '', wechat: '  ', discord: '' },
    { wechat: 'valid_id', phone: 'Call me' },
    { wechat: 'valid_id', discord: 'Display Name' },
    { phone: '+86 13800138000', wechat: 'display name' },
    { wechat: 'valid_id', discord: 'name..two' },
    { wechat: 'valid_id', phone: '+'.concat('1'.repeat(40)) },
    { discord: 'valid.name', wechat: 'x'.repeat(65) },
    { wechat: 'valid_id', discord: 'x'.repeat(33) },
    { wechat: 'valid_id', phone: '+86\n13800138000' },
  ];
  for (const contacts of contactSets) {
    const response = await submit({ ...baseApplication, contacts });
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  await assert.rejects(readdir(storageDir), { code: 'ENOENT' });
});

test('malformed contact objects, unknown fields and mixed payload versions are rejected', async t => {
  const { submit, storageDir } = await fixture(t);
  const invalidApplications = [
    ...[null, [], 'wechat', 123, true, { wechat: 123 }, { phone: null }, { discord: [] }, { wechat: {} }, { telegram: 'example' }]
      .map(contacts => ({ ...baseApplication, contacts })),
    { ...multiContactApplication, unexpected: 'field' },
    { ...application, contacts: { wechat: 'example_team' } },
    { ...multiContactApplication, contacts: JSON.parse('{"wechat":"example_team","__proto__":{}}') },
  ];
  for (const payload of invalidApplications) {
    const response = await submit(payload);
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  await assert.rejects(readdir(storageDir), { code: 'ENOENT' });
});

test('incomplete, invalid, overlong, and extra fields are rejected without saving', async t => {
  const { submit, storageDir } = await fixture(t);
  const invalidApplications = [
    { ...application, teamName: '   ' },
    { ...application, organization: null },
    { ...application, teamName: 't'.repeat(121) },
    { ...application, email: 'not-an-email' },
    { ...application, contactMethod: 'telegram' },
    { ...application, contactMethod: 'phone', contactValue: 'Call me' },
    { ...application, contactMethod: 'wechat', contactValue: 'my display name' },
    { ...application, contactMethod: 'discord', contactValue: 'Display Name' },
    { ...application, contactMethod: 'discord', contactValue: 'name..two' },
    { ...application, contactValue: 'x'.repeat(65) },
    { ...application, modelName: 'Example\nModel' },
    { ...application, privateNote: 'Unexpected field' },
    null,
    [],
  ];
  for (const payload of invalidApplications) {
    const response = await submit(payload);
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  await assert.rejects(readdir(storageDir), { code: 'ENOENT' });
});

test('invalid JSON, wrong content type, large bodies and foreign origins fail', async t => {
  const { submit } = await fixture(t);
  assert.equal((await submit(application, { body: '{' })).status, 400);
  assert.equal((await submit(application, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await submit(application, { body: JSON.stringify({ teamName: 'x'.repeat(17 * 1024) }) })).status, 413);
  const foreign = await submit(application, { headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.example' } });
  assert.equal(foreign.status, 403);
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);
});

test('stored applications cannot be retrieved or enumerated over HTTP', async t => {
  const { baseUrl, submit } = await fixture(t);
  const { applicationId } = await (await submit()).json();
  const response = await fetch(`${baseUrl}/api/evaluation-applications`);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal((await fetch(`${baseUrl}/submissions/${applicationId}.json`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/api/evaluation-applications/${applicationId}`)).status, 404);
});

test('storage failures never return success or leak paths/contact details', async t => {
  const { submit, storageDir } = await fixture(t, { brokenStorage: true });
  const response = await submit();
  assert.equal(response.status, 503);
  const text = await response.text();
  assert.ok(!text.includes(storageDir));
  assert.ok(!text.includes(application.email));
  assert.deepEqual(JSON.parse(text), { error: 'Your application could not be saved. Please try again later.' });
});

test('concurrent submissions keep distinct complete records', async t => {
  const { submit, storageDir } = await fixture(t);
  const responses = await Promise.all(Array.from({ length: 8 }, (_, index) => submit({ ...application, modelName: `Model ${index}` })));
  assert.ok(responses.every(response => response.status === 201));
  const receipts = await Promise.all(responses.map(response => response.json()));
  assert.equal(new Set(receipts.map(receipt => receipt.applicationId)).size, 8);
  const files = await readdir(storageDir);
  assert.equal(files.length, 8);
  const saved = await Promise.all(files.map(async filename => JSON.parse(await readFile(join(storageDir, filename), 'utf8'))));
  assert.deepEqual(saved.map(item => item.modelName).sort(), Array.from({ length: 8 }, (_, index) => `Model ${index}`));
});

test('configuration only accepts loopback, valid ports and external absolute storage', () => {
  assert.equal(readConfiguration({}).host, '127.0.0.1');
  assert.equal(readConfiguration({}).port, 8878);
  assert.throws(() => readConfiguration({ EVAL_API_HOST: '0.0.0.0' }), /loopback/);
  assert.throws(() => readConfiguration({ EVAL_API_PORT: '0' }), /port/);
  assert.throws(() => readConfiguration({ EVAL_API_PORT: '65536' }), /port/);
  assert.throws(() => readConfiguration({ EVAL_API_PORT: '8878abc' }), /port/);
  assert.throws(() => readConfiguration({ EVAL_SUBMISSIONS_DIR: './public/submissions' }), /outside/);
  assert.equal(readConfiguration({ EVAL_SUBMISSIONS_DIR: '/tmp/example-eval-storage', EVAL_API_HOST: '::1', EVAL_API_PORT: '8888' }).port, 8888);
});
