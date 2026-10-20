import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sendApplication } from './eval-transport.mjs';

const attempt = {
  key: '6a43d841-0e37-4ae5-92d9-e270f343e812',
  body: JSON.stringify({ teamName: 'Test team', contacts: { wechat: 'test' } }),
};
const receipt = { applicationId: attempt.key, submittedAt: '2026-10-20T00:00:00.000Z' };
const configuration = { mode: 'cloudbase', cloudbaseEnv: 'test-env-123', publishableKey: 'public-test-value' };
const reply = (value, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => value });

test('native CloudBase submission preserves original fields and retry identifier', async () => {
  let captured;
  const actual = await sendApplication(attempt, configuration, async (url, options) => {
    captured = { url, options };
    return reply({ result: { statusCode: 201, ...receipt }, requestId: 'platform-request' });
  });
  assert.deepEqual(actual, receipt);
  assert.equal(captured.url, 'https://test-env-123.api.tcloudbasegateway.com/v1/functions/robovalue-submit');
  assert.deepEqual(JSON.parse(captured.options.body), { idempotencyKey: attempt.key, application: JSON.parse(attempt.body) });
  assert.equal(captured.options.headers.Authorization, 'Bearer public-test-value');
  assert.equal(captured.options.redirect, 'error');
  assert.equal(captured.options.credentials, 'omit');
});

test('native HTTP accepts a bare saved receipt with the function status 201', async () => {
  assert.deepEqual(await sendApplication(attempt, configuration,
    async () => reply({ statusCode: 201, ...receipt })), receipt);
});

test('HTTP 200 containing a rejected function result cannot show success', async () => {
  for (const statusCode of [400, 409, 429, 500, 503, undefined]) {
    await assert.rejects(sendApplication(attempt, configuration, async () => reply({ result: { statusCode, ...receipt } })));
  }
  await assert.rejects(sendApplication(attempt, configuration, async () => reply({ statusCode: 429, ...receipt })));
});

test('a bare function status 503 rejects even with matching receipt fields or a nested success', async () => {
  for (const value of [
    { statusCode: 503, ...receipt },
    { statusCode: 503, result: { statusCode: 201, ...receipt } },
  ]) await assert.rejects(sendApplication(attempt, configuration, async () => reply(value)));
});

test('retry receipt may be returned as JSON text in the platform result', async () => {
  assert.deepEqual(await sendApplication(attempt, configuration, async () => reply({ result: JSON.stringify({ statusCode: 200, ...receipt }) })), receipt);
});

test('unrelated or malformed receipts and gateway failures are not accepted', async () => {
  for (const value of [null, receipt, { result: 'not json' },
    { result: { statusCode: 201, ...receipt, applicationId: 'another-id' } },
    { result: { statusCode: 201, ...receipt, submittedAt: 'invalid' } },
    { statusCode: 201, ...receipt, applicationId: 'another-id' },
    { statusCode: 201, ...receipt, submittedAt: 'invalid' },
  ]) {
    await assert.rejects(sendApplication(attempt, configuration, async () => reply(value)));
  }
  await assert.rejects(sendApplication(attempt, configuration, async () => reply({ result: { statusCode: 201, ...receipt } }, 403)));
});

test('legacy API transport still requires its matching saved receipt', async () => {
  const actual = await sendApplication(attempt, { mode: 'api' }, async (url, options) => {
    assert.equal(url, '/api/evaluation-applications');
    assert.equal(options.headers['Idempotency-Key'], attempt.key);
    assert.equal(options.body, attempt.body);
    return reply(receipt, 201);
  });
  assert.deepEqual(actual, receipt);
});

test('missing native configuration fails before contacting a server', async () => {
  for (const change of [{ cloudbaseEnv: '' }, { cloudbaseEnv: 'https://unexpected.example' }, { publishableKey: '' }, { publishableKey: 'bad\r\nvalue' }]) {
    await assert.rejects(sendApplication(attempt, { ...configuration, ...change }, () => assert.fail('must not send')));
  }
});
