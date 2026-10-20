export const UNCONFIRMED_MESSAGE = 'We couldn’t confirm your submission. Your details are still here. Please try again.';
const LIMIT_TYPES = new Set(['ip_minute', 'ip_day', 'global_ten_minutes', 'global_day']);

// Only a complete business-limit response may start a countdown. A platform
// 429, malformed result or arbitrary server text must not invent a wait time.
export function submissionNotice(error, now = Date.now()) {
  if (error?.kind === 'limit' && LIMIT_TYPES.has(error.limitType)
      && Number.isSafeInteger(error.retryAfterSeconds) && error.retryAfterSeconds >= 1 && error.retryAfterSeconds <= 86400) {
    return { kind: 'limit', limitType: error.limitType, retryAt: now + error.retryAfterSeconds * 1000 };
  }
  return { kind: error?.kind === 'unavailable' ? 'unavailable' : 'unconfirmed' };
}

export function describeSubmissionNotice(notice, now = Date.now()) {
  if (!notice) return { waiting: false, message: '', button: 'Submit Application' };
  if (notice.kind !== 'limit') return { waiting: false, button: 'Try again', message: notice.kind === 'unavailable'
    ? 'The submission service is temporarily unavailable. Your details are still here. Please try again later.'
    : UNCONFIRMED_MESSAGE };
  const seconds = Math.max(0, Math.ceil((notice.retryAt - now) / 1000));
  if (!seconds) return { waiting: false, button: 'Try again', message: 'You can try submitting again now.' };
  const daily = ['ip_day', 'global_day'].includes(notice.limitType);
  if (daily) {
    const date = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(notice.retryAt));
    return { waiting: true, button: notice.limitType === 'ip_day' ? 'Daily limit reached' : 'Submissions paused', message: notice.limitType === 'ip_day'
      ? `You’ve reached the daily submission limit. Please try again after ${date}.`
      : `Submissions are temporarily paused. Please try again after ${date}.` };
  }
  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return { waiting: true, button: `Try again · ${countdown}`, message: notice.limitType === 'ip_minute'
    ? 'You’re submitting too frequently. Please wait before trying again.'
    : 'We’re receiving many submissions. Please wait before trying again.' };
}
