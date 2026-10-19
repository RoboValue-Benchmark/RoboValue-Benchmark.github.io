import React, { useEffect, useRef, useState } from 'react';
import { DISCORD_INVITE } from './community';

export function EvaluationFailure({ headingRef, details, onBack }) {
  const [copyStatus, setCopyStatus] = useState('idle');
  const manualCopyRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (copyStatus !== 'copied') return;
    const timer = window.setTimeout(() => setCopyStatus('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    if (copyStatus === 'manual') {
      manualCopyRef.current?.focus();
      manualCopyRef.current?.select();
    }
  }, [copyStatus]);

  async function copyDetails() {
    setCopyStatus('copying');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(details);
      if (mountedRef.current) setCopyStatus('copied');
    } catch {
      if (mountedRef.current) setCopyStatus('manual');
    }
  }

  return <div className="eval-failure">
    <header className="eval-failure-summary">
      <span className="eval-failure-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5" />
          <circle cx="12" cy="16" r=".8" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <h1 ref={headingRef} tabIndex={-1} id="eval-failure-heading">Sorry, something went wrong on our end</h1>
      <p>We couldn’t submit your application at this time, and we apologize for the inconvenience. You can still arrange your evaluation with the RoboValue team through our WeChat group or Discord server.</p>
    </header>

    <section className="eval-next-steps" aria-labelledby="eval-failure-next-steps-heading">
      <h2 id="eval-failure-next-steps-heading">Next Steps</h2>
      <div className="eval-failure-channels">
        <section className="eval-failure-channel" aria-labelledby="eval-failure-wechat-heading">
          <h3 id="eval-failure-wechat-heading">WeChat</h3>
          <p className="eval-failure-channel-note">Evaluation group</p>
          <a className="eval-qr" href="/assets/evaluation-wechat.png?v=20261020" target="_blank" rel="noopener noreferrer" aria-label="Open the evaluation WeChat QR code at full size">
            <img src="/assets/evaluation-wechat.png?v=20261020" width="540" height="830" alt="RoboValue evaluation WeChat group QR code, valid before October 27" />
          </a>
          <p className="eval-failure-scan">Scan with WeChat</p>
        </section>
        <section className="eval-failure-channel eval-failure-discord" aria-labelledby="eval-failure-discord-heading">
          <h3 id="eval-failure-discord-heading">Discord</h3>
          <div className="eval-failure-discord-body">
            <span className="eval-discord-symbol" aria-hidden="true">
              <svg width="48" height="40" viewBox="0 0 24 20" fill="currentColor">
                <path d="M19.7 2.6a18 18 0 0 0-4.2-1.3l-.6 1.2a16 16 0 0 0-5.8 0l-.6-1.2a18 18 0 0 0-4.2 1.3C1.7 6.4.9 10.1 1.3 13.8a18 18 0 0 0 5.2 2.6l1.1-1.8-1.6-.8.4-.3a15 15 0 0 0 11.2 0l.4.3-1.6.8 1.1 1.8a18 18 0 0 0 5.2-2.6c.4-3.7-.4-7.4-3-11.2Z" />
                <ellipse cx="8" cy="9.6" rx="1.5" ry="1.8" className="eval-discord-eye" /><ellipse cx="16" cy="9.6" rx="1.5" ry="1.8" className="eval-discord-eye" />
              </svg>
            </span>
            <a className="eval-success-join" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join Discord</a>
          </div>
        </section>
      </div>

      <div className="eval-copy-application">
        <p id="eval-copy-description">You can also copy your application details<br className="eval-copy-break" />{' '}and share them privately with a team member.</p>
        <button className="eval-copy-button" type="button" onClick={copyDetails} disabled={copyStatus === 'copying'} aria-describedby="eval-copy-description">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {copyStatus === 'copied' ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></>}
          </svg>
          {copyStatus === 'copied' ? 'Copied' : copyStatus === 'copying' ? 'Copying…' : 'Copy application details'}
        </button>
        <p className="sr-only" role="status">{copyStatus === 'copied' ? 'Application details copied.' : copyStatus === 'manual' ? 'Automatic copying isn’t available. Select and copy the text below.' : ''}</p>
        {copyStatus === 'manual' && <div className="eval-manual-copy">
          <label htmlFor="eval-application-details">Application details</label>
          <p id="eval-manual-copy-help">Automatic copying isn’t available. Select and copy the text below.</p>
          <textarea id="eval-application-details" ref={manualCopyRef} readOnly value={details} rows={9} aria-describedby="eval-manual-copy-help" onFocus={event => event.target.select()} />
        </div>}
      </div>
    </section>

    <footer className="eval-failure-footer">
      <button type="button" className="eval-back-to-form" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to form
      </button>
    </footer>
  </div>;
}
