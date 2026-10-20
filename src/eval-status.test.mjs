import test from 'node:test';
import assert from 'node:assert/strict';
import { submissionNotice, describeSubmissionNotice } from './eval-status.mjs';
import { sendApplication } from './eval-transport.mjs';

const NOW = Date.parse('2026-10-20T06:00:00Z');
const attempt = { key: '6a43d841-0e37-4ae5-92d9-e270f343e812', body: '{}' };
const config = { mode: 'cloudbase', cloudbaseEnv: 'test-env', publishableKey: 'public-test-key' };
async function rejected(value, status = 200) {
  try { await sendApplication(attempt, config, async () => ({ ok: status === 200, status, json: async () => value })); }
  catch (error) { return error; }
  assert.fail('Rejected result accepted');
}
test('only explicit valid business limits start a countdown, never a bare gateway 429', async () => {
  for (const status of [200, 429]) {
    const error = await rejected({ result: { statusCode: 429, code: 'RATE_LIMITED', limitType: 'ip_minute', retryAfterSeconds: 42 } }, status);
    const notice = submissionNotice(error, NOW);
    assert.equal(notice.retryAt, NOW + 42_000);
    assert.equal(describeSubmissionNotice(notice, NOW).button, 'Try again · 00:42');
    assert.equal(describeSubmissionNotice(notice, NOW + 42_000).waiting, false);
  }
  for (const value of [null, { code: 'EXCEED_RATELIMIT' }, { statusCode: 429, code: 'RATE_LIMITED', limitType: 'made-up', retryAfterSeconds: 42 },
    { statusCode: 429, code: 'RATE_LIMITED', limitType: 'ip_day', retryAfterSeconds: 999999 }]) {
    assert.equal(submissionNotice(await rejected(value, 429), NOW).kind, 'unconfirmed');
  }
});
test('daily limits display a dated recovery time and unavailable/unknown states invent no wait', async () => {
  const daily = submissionNotice({ kind: 'limit', limitType: 'global_day', retryAfterSeconds: 3600 }, NOW);
  const display = describeSubmissionNotice(daily, NOW);
  assert.equal(display.button, 'Submissions paused');
  assert.match(display.message, /2026/);
  assert.doesNotMatch(display.button, /3600/);
  const unavailable = submissionNotice(await rejected({ statusCode: 503, code: 'NOT_ENABLED' }), NOW);
  assert.equal(unavailable.kind, 'unavailable');
  for (const notice of [unavailable, submissionNotice(new Error('private SDK message'), NOW)]) {
    assert.equal(describeSubmissionNotice(notice, NOW).waiting, false);
    assert.equal(describeSubmissionNotice(notice, NOW).button, 'Try again');
    assert.ok(!JSON.stringify(notice).includes('private SDK'));
  }
});
