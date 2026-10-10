import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { chmod, lstat, mkdir, open, realpath, rename, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_PATH = '/api/evaluation-applications';
const MAX_BODY_BYTES = 16 * 1024;
const FIELD_LIMITS = { teamName: 120, organization: 160, modelName: 160, email: 254 };
const CONTACT_LIMITS = { phone: 40, wechat: 64, discord: 32 };

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function outsideRepository(path) {
  const distance = relative(REPOSITORY_ROOT, path);
  return distance === '..' || distance.startsWith(`..${sep}`) || isAbsolute(distance);
}

export function readConfiguration(environment = process.env) {
  const host = environment.EVAL_API_HOST || '127.0.0.1';
  const portText = environment.EVAL_API_PORT || '8878';
  if (!['127.0.0.1', '::1'].includes(host)) throw new Error('EVAL_API_HOST must be a loopback address.');
  if (!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) {
    throw new Error('EVAL_API_PORT must be a port between 1 and 65535.');
  }
  const storageDir = environment.EVAL_SUBMISSIONS_DIR || resolve(REPOSITORY_ROOT, '../robovalue-eval-submissions/submissions');
  if (!isAbsolute(storageDir) || !outsideRepository(resolve(storageDir))) {
    throw new Error('EVAL_SUBMISSIONS_DIR must be an absolute directory outside the website repository.');
  }
  return { host, port: Number(portText), storageDir: resolve(storageDir) };
}

function validateContact(contactMethod, contactValue) {
  if (!Object.hasOwn(CONTACT_LIMITS, contactMethod)) {
    throw new RequestError(400, 'Please select Phone, WeChat, or Discord.');
  }
  if (contactValue.length > CONTACT_LIMITS[contactMethod]) {
    throw new RequestError(400, 'The contact information exceeds the allowed length.');
  }
  if (contactMethod === 'phone' && (!/^\+?[\d\s().-]+$/.test(contactValue) || contactValue.replace(/\D/g, '').length < 6)) {
    throw new RequestError(400, 'Please enter a valid phone number, including the country code.');
  }
  if (contactMethod === 'wechat' && /\s/.test(contactValue)) {
    throw new RequestError(400, 'Please enter your WeChat ID without spaces.');
  }
  if (contactMethod === 'discord' && (!/^[a-z0-9_.]{2,32}$/.test(contactValue) || contactValue.includes('..'))) {
    throw new RequestError(400, 'Please enter your unique Discord username, not your display name.');
  }
}

function singleLineText(value) {
  if (typeof value !== 'string') {
    throw new RequestError(400, 'Please enter text in each application field.');
  }
  const trimmed = value.trim();
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new RequestError(400, 'Please use single-line text without control characters.');
  }
  return trimmed;
}

export function validateApplication(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError(400, 'Please submit the application as a JSON object.');
  }
  // Keep accepting the previous form while visitors may still have it open.
  const usesContacts = Object.hasOwn(payload, 'contacts');
  const allowedFields = [...Object.keys(FIELD_LIMITS), ...(usesContacts ? ['contacts'] : ['contactMethod', 'contactValue'])];
  if (Object.keys(payload).some(key => !allowedFields.includes(key))) {
    throw new RequestError(400, 'The application contains an unexpected field.');
  }
  const application = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    application[field] = singleLineText(payload[field]);
    if (!application[field]) throw new RequestError(400, 'Please complete all required fields.');
    if (application[field].length > limit) {
      throw new RequestError(400, 'One or more fields exceed the allowed length.');
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) {
    throw new RequestError(400, 'Please enter a valid email address.');
  }
  if (usesContacts) {
    if (!payload.contacts || typeof payload.contacts !== 'object' || Array.isArray(payload.contacts)) {
      throw new RequestError(400, 'Please provide your contact details as an object.');
    }
    if (Object.keys(payload.contacts).some(method => !Object.hasOwn(CONTACT_LIMITS, method))) {
      throw new RequestError(400, 'Please use Phone, WeChat, or Discord for your contact details.');
    }
    application.contacts = {};
    for (const [method, value] of Object.entries(payload.contacts)) {
      const contactValue = singleLineText(value);
      if (!contactValue) continue;
      validateContact(method, contactValue);
      application.contacts[method] = contactValue;
    }
    if (!Object.keys(application.contacts).length) {
      throw new RequestError(400, 'Please provide at least one contact method: Phone, WeChat, or Discord.');
    }
  } else {
    application.contactMethod = singleLineText(payload.contactMethod);
    application.contactValue = singleLineText(payload.contactValue);
    if (!application.contactMethod || !application.contactValue) {
      throw new RequestError(400, 'Please complete all required fields.');
    }
    validateContact(application.contactMethod, application.contactValue);
  }
  return application;
}

async function prepareStorage(storageDir) {
  if (!isAbsolute(storageDir) || !outsideRepository(resolve(storageDir))) {
    throw new Error('Application storage must be outside the website repository.');
  }
  await mkdir(storageDir, { recursive: true, mode: 0o700 });
  const info = await lstat(storageDir);
  if (!info.isDirectory() || info.isSymbolicLink() || !outsideRepository(await realpath(storageDir))) {
    throw new Error('Application storage must be a private directory outside the website repository.');
  }
  await chmod(storageDir, 0o700);
}

async function saveApplication(storageDir, application) {
  await prepareStorage(storageDir);
  const applicationId = randomUUID();
  const submittedAt = new Date().toISOString();
  const temporaryPath = resolve(storageDir, `.${applicationId}.tmp`);
  const finalPath = resolve(storageDir, `${applicationId}.json`);
  let handle;
  let moved = false;
  try {
    handle = await open(temporaryPath, 'wx', 0o600);
    await handle.writeFile(`${JSON.stringify({ applicationId, submittedAt, ...application }, null, 2)}\n`, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporaryPath, finalPath);
    moved = true;
    const directory = await open(storageDir, 'r');
    try { await directory.sync(); } finally { await directory.close(); }
    return { applicationId, submittedAt };
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await unlink(moved ? finalPath : temporaryPath).catch(() => {});
    throw error;
  }
}

function readBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let bytes = 0;
    let rejected = false;
    request.on('data', chunk => {
      if (rejected) return;
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        rejected = true;
        chunks.length = 0;
        rejectBody(new RequestError(413, 'The application is too large. Please shorten the fields and try again.'));
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => { if (!rejected) resolveBody(Buffer.concat(chunks).toString('utf8')); });
    request.on('error', () => rejectBody(new RequestError(400, 'The application could not be read. Please try again.')));
    request.on('aborted', () => rejectBody(new RequestError(400, 'The application was interrupted. Please try again.')));
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
}

function verifyOrigin(request) {
  // The Vite proxy preserves the browser's Host header. No cross-origin access
  // is enabled; a public HTTPS gateway must be configured separately later.
  const origin = request.headers.origin;
  if (!origin) return;
  let parsed;
  try { parsed = new URL(origin); } catch { /* Invalid origins are rejected below. */ }
  if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || parsed.host !== request.headers.host) {
    throw new RequestError(403, 'This application must be submitted from the RoboValue website.');
  }
}

export function createApplicationServer({ storageDir }) {
  const server = createServer(async (request, response) => {
    try {
      if (request.url !== API_PATH) throw new RequestError(404, 'This endpoint does not exist.');
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        throw new RequestError(405, 'Please submit applications using POST.');
      }
      verifyOrigin(request);
      if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        throw new RequestError(415, 'Please submit the application as JSON.');
      }
      const body = await readBody(request);
      let payload;
      try { payload = JSON.parse(body); } catch { throw new RequestError(400, 'The application is not valid JSON.'); }
      const application = validateApplication(payload);
      const receipt = await saveApplication(storageDir, application);
      sendJson(response, 201, receipt);
    } catch (error) {
      if (response.destroyed || response.writableEnded) return;
      const status = error instanceof RequestError ? error.status : 503;
      const message = error instanceof RequestError ? error.message : 'Your application could not be saved. Please try again later.';
      sendJson(response, status, { error: message });
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 40;
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const configuration = readConfiguration();
    await prepareStorage(configuration.storageDir);
    const server = createApplicationServer(configuration);
    server.on('error', () => {
      console.error('Eval service could not listen. Check its port and configuration.');
      process.exitCode = 1;
    });
    server.listen(configuration.port, configuration.host, () => {
      console.log(`Eval application service listening on ${configuration.host}:${configuration.port}.`);
      console.log('Application contents and contact details are never written to service logs.');
    });
    for (const signal of ['SIGTERM', 'SIGINT']) {
      process.on(signal, () => server.close(() => process.exit(0)));
    }
  } catch {
    console.error('Eval service could not start. Check its loopback address, port, and private storage configuration.');
    process.exitCode = 1;
  }
}
