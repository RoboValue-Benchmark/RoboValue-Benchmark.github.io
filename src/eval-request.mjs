function createSubmissionKey(cryptoProvider) {
  if (typeof cryptoProvider?.randomUUID === 'function') return cryptoProvider.randomUUID();
  if (typeof cryptoProvider?.getRandomValues !== 'function') {
    throw new Error('Secure submission is unavailable in this browser. Please try another browser, or contact us through the community.');
  }
  const bytes = cryptoProvider.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function prepareSubmissionAttempt(payload, previousAttempt, cryptoProvider = globalThis.crypto) {
  const body = JSON.stringify(payload);
  if (previousAttempt?.body === body) return previousAttempt;
  return { body, key: createSubmissionKey(cryptoProvider) };
}
