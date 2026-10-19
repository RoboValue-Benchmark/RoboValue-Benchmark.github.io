import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareSubmissionAttempt } from './eval-request.mjs';

const payload = {
  teamName: 'Test team', organization: 'Test organization', modelName: 'Test model',
  email: 'test@example.org', contacts: { phone: '', wechat: 'test-team', discord: '' },
};

test('a retry of unchanged data keeps its original request key and body', () => {
  let generated = 0;
  const cryptoProvider = { randomUUID: () => `request-${++generated}` };
  const attempt = prepareSubmissionAttempt(payload, null, cryptoProvider);
  const retry = prepareSubmissionAttempt(structuredClone(payload), attempt, cryptoProvider);
  assert.equal(retry, attempt);
  assert.equal(retry.body, JSON.stringify(payload));
  assert.equal(generated, 1);
});

test('changed application or contact fields cannot reuse a previous key', () => {
  let generated = 0;
  const cryptoProvider = { randomUUID: () => `request-${++generated}` };
  const attempt = prepareSubmissionAttempt(payload, null, cryptoProvider);
  const updatedModel = prepareSubmissionAttempt({ ...payload, modelName: 'New model' }, attempt, cryptoProvider);
  const updatedContact = prepareSubmissionAttempt({ ...payload, contacts: { ...payload.contacts, wechat: 'new-team' } }, attempt, cryptoProvider);
  assert.notEqual(updatedModel.key, attempt.key);
  assert.notEqual(updatedContact.key, attempt.key);
});

test('clearing an attempt starts a new request even with the original form contents', () => {
  let generated = 0;
  const cryptoProvider = { randomUUID: () => `request-${++generated}` };
  const attempt = prepareSubmissionAttempt(payload, null, cryptoProvider);
  const nextAttempt = prepareSubmissionAttempt(payload, null, cryptoProvider);
  assert.notEqual(nextAttempt.key, attempt.key);
});

test('without randomUUID, secure random bytes produce a version 4 UUID', () => {
  let calls = 0;
  const cryptoProvider = {
    getRandomValues(bytes) {
      calls += 1;
      return bytes.fill(255);
    },
  };
  const attempt = prepareSubmissionAttempt(payload, null, cryptoProvider);
  assert.equal(attempt.key, 'ffffffff-ffff-4fff-bfff-ffffffffffff');
  assert.equal(calls, 1);
});

test('without a secure random source, submission fails instead of using a weak key', () => {
  assert.throws(() => prepareSubmissionAttempt(payload, null, {}), /Secure submission is unavailable/);
});
