export class SubmissionError extends Error {
  constructor(kind, extra = {}) { super('Submission was not confirmed.'); this.kind = kind; Object.assign(this, extra); }
}

function rejected(result) {
  if (result?.statusCode === 429 && result.code === 'RATE_LIMITED') throw new SubmissionError('limit', { limitType: result.limitType, retryAfterSeconds: result.retryAfterSeconds });
  if (result?.statusCode === 503 && result.code === 'NOT_ENABLED') throw new SubmissionError('unavailable');
  throw new SubmissionError('unconfirmed');
}

const UNCONFIRMED = 'Your submission could not be confirmed. Please try again.';

function submissionRequest(attempt, configuration) {
  if (configuration.mode === 'cloudbase') {
    const env = configuration.cloudbaseEnv?.trim();
    const key = configuration.publishableKey?.trim();
    if (!/^[a-z][a-z0-9-]{2,79}$/.test(env || '') || !key || /[\r\n]/.test(key)) {
      throw new Error('The submission service is not configured.');
    }
    // Only a Publishable Key belongs in this browser configuration. Administrative
    // API keys, SMTP authorization and cloud credentials must remain server-side.
    return {
      url: `https://${env}.api.tcloudbasegateway.com/v1/functions/robovalue-submit`,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ idempotencyKey: attempt.key, application: JSON.parse(attempt.body) }),
    };
  }
  if (configuration.mode !== 'api') throw new Error('The submission service is not enabled.');
  return {
    url: configuration.endpoint?.trim() || '/api/evaluation-applications',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.key },
    body: attempt.body,
  };
}

export async function sendApplication(attempt, configuration, fetchRequest = globalThis.fetch) {
  const request = submissionRequest(attempt, configuration);
  const response = await fetchRequest(request.url, {
    method: 'POST', headers: request.headers, body: request.body,
    signal: configuration.signal, credentials: 'omit', redirect: 'error',
  });
  const envelope = await response.json().catch(() => null);
  if (!response.ok && response.status !== 429 && response.status !== 503) throw new SubmissionError('unconfirmed');
  let result = envelope;
  if (configuration.mode === 'cloudbase') {
    // Native HTTP responses may contain the function JSON directly or wrap it
    // in `result`. The function's own status always determines acceptance.
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) throw new Error(UNCONFIRMED);
    if (!Object.hasOwn(envelope, 'statusCode')) {
      if (!Object.hasOwn(envelope, 'result')) throw new Error(UNCONFIRMED);
      result = envelope.result;
    }
    if (typeof result === 'string') {
      try { result = JSON.parse(result); } catch { throw new Error(UNCONFIRMED); }
    }
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error(UNCONFIRMED);
    if (![200, 201].includes(result?.statusCode)) rejected(result);
  }
  if (!response.ok) throw new SubmissionError('unconfirmed');
  if (result?.applicationId !== attempt.key
      || typeof result.submittedAt !== 'string'
      || !Number.isFinite(Date.parse(result.submittedAt))) {
    throw new Error(UNCONFIRMED);
  }
  return { applicationId: result.applicationId, submittedAt: result.submittedAt };
}
