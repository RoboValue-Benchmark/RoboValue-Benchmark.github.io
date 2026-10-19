import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './benchmark';
import { DISCORD_INVITE } from './community';
import { prepareSubmissionAttempt } from './eval-request.mjs';
import { EvaluationFailure } from './eval-failure';
import './eval.css';

// Opt in after the receiver is ready. Static hosting defaults to the contact fallback.
const ONLINE_SUBMISSION_ENABLED = import.meta.env.VITE_EVAL_SUBMISSION_MODE === 'api';

const BASIC_FIELDS = [
  { name: 'teamName', label: 'Team Name', maxLength: 120, placeholder: 'Team name', autoComplete: 'off' },
  { name: 'organization', label: 'Organization', maxLength: 160, placeholder: 'Organization', autoComplete: 'organization' },
  { name: 'modelName', label: 'Model Name', maxLength: 160, placeholder: 'Model name and version', autoComplete: 'off' },
  { name: 'email', label: 'Email', type: 'email', maxLength: 254, placeholder: 'Email address', autoComplete: 'email' },
];
const CONTACT_METHODS = {
  phone: { fieldLabel: 'Phone Number', type: 'tel', maxLength: 40, autoComplete: 'tel', placeholder: 'Phone' },
  wechat: { fieldLabel: 'WeChat ID', maxLength: 64, autoComplete: 'off', placeholder: 'WeChat ID' },
  discord: { fieldLabel: 'Discord Username', maxLength: 32, autoComplete: 'off', placeholder: 'Username' },
};

function validateApplication(values) {
  const errors = {};
  for (const field of BASIC_FIELDS) {
    if (!values[field.name].trim()) errors[field.name] = `Please enter your ${field.label.toLowerCase()}.`;
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!Object.values(values.contacts).some(value => value.trim())) errors.contacts = 'Please provide at least one contact method.';
  for (const [method, rawValue] of Object.entries(values.contacts)) {
    const value = rawValue.trim();
    if (!value) continue;
    if (method === 'phone' && (!/^\+?[\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 6)) errors.phone = 'Please enter a valid phone number.';
    if (method === 'wechat' && /\s/.test(value)) errors.wechat = 'Please enter your WeChat ID without spaces.';
    if (method === 'discord' && (!/^[a-z0-9_.]{2,32}$/.test(value) || value.includes('..'))) errors.discord = 'Use your unique username, not your display name.';
  }
  return errors;
}

function EvaluationCommunity() {
  return <aside className="eval-community" aria-labelledby="eval-community-heading">
    <h2 id="eval-community-heading">Evaluation Community</h2>
    <p className="eval-community-intro">Join our WeChat or Discord groups to connect with the evaluation team and other participants.</p>
    <div className="eval-community-reminder">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></svg>
      <p>Please use the same <strong>Team Name</strong> provided in your application when joining.</p>
    </div>
    <section className="eval-channel eval-wechat" aria-labelledby="eval-wechat-heading">
      <h3 id="eval-wechat-heading">WeChat Group</h3>
      <a className="eval-qr" href="/assets/evaluation-wechat.png?v=20261020" target="_blank" rel="noopener noreferrer" aria-label="Open the evaluation WeChat QR code at full size">
        <img src="/assets/evaluation-wechat.png?v=20261020" width="540" height="830" alt="RoboValue evaluation WeChat group QR code, valid before October 27" />
      </a>
      <p>Scan to join</p>
    </section>
    <section className="eval-channel eval-discord" aria-labelledby="eval-discord-heading">
      <h3 id="eval-discord-heading">Discord Community</h3>
      <a className="eval-community-link" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join Discord<Icon size={20} /></a>
    </section>
  </aside>;
}

function EvaluationSuccess({ successRef }) {
  return <div className="eval-success">
    <header className="eval-success-summary">
      <span className="eval-success-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
      </span>
      <h2 ref={successRef} tabIndex={-1} id="eval-success-heading">Application Submitted!</h2>
      <p>Thank you for your interest in RoboValue. Our team will contact you using the details provided in your application to coordinate the next steps.</p>
    </header>

    <section className="eval-next-steps" aria-labelledby="eval-next-steps-heading">
      <h3 id="eval-next-steps-heading">Next Steps</h3>
      <div className="eval-success-community">
        <span className="eval-community-symbol"><Icon name="users" size={26} /></span>
        <div>
          <h4>Join the Evaluation Community</h4>
          <p>You're also welcome to join our evaluation community on WeChat or Discord.</p>
        </div>
      </div>
      <div className="eval-team-note" role="note">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></svg>
        <div><p>Please identify your team when joining.</p><p>Use the same team name provided in your application.</p></div>
      </div>
      <div className="eval-success-channels">
        <section className="eval-success-channel" aria-labelledby="eval-success-wechat-heading">
          <a className="eval-qr" href="/assets/evaluation-wechat.png?v=20261020" target="_blank" rel="noopener noreferrer" aria-label="Open the evaluation WeChat QR code at full size">
            <img src="/assets/evaluation-wechat.png?v=20261020" width="540" height="830" alt="RoboValue evaluation WeChat group QR code, valid before October 27" />
          </a>
          <h4 id="eval-success-wechat-heading">WeChat</h4>
          <p>Scan to join</p>
        </section>
        <section className="eval-success-channel" aria-labelledby="eval-success-discord-heading">
          <span className="eval-discord-symbol" aria-hidden="true">
            <svg width="42" height="34" viewBox="0 0 24 20" fill="currentColor">
              <path d="M19.7 2.6a18 18 0 0 0-4.2-1.3l-.6 1.2a16 16 0 0 0-5.8 0l-.6-1.2a18 18 0 0 0-4.2 1.3C1.7 6.4.9 10.1 1.3 13.8a18 18 0 0 0 5.2 2.6l1.1-1.8-1.6-.8.4-.3a15 15 0 0 0 11.2 0l.4.3-1.6.8 1.1 1.8a18 18 0 0 0 5.2-2.6c.4-3.7-.4-7.4-3-11.2Z" />
              <ellipse cx="8" cy="9.6" rx="1.5" ry="1.8" className="eval-discord-eye" /><ellipse cx="16" cy="9.6" rx="1.5" ry="1.8" className="eval-discord-eye" />
            </svg>
          </span>
          <h4 id="eval-success-discord-heading">Discord</h4>
          <a className="eval-success-join" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join community</a>
        </section>
      </div>
    </section>

    <footer className="eval-success-footer">
      <a className="eval-document-link" href="/doc/get-started/evaluation/"><Icon name="book" size={22} /><span>View Evaluation Workflow</span><Icon name="external" size={18} /></a>
    </footer>
  </div>;
}

export function EvaluationPage() {
  const [values, setValues] = useState({ teamName: '', organization: '', modelName: '', email: '' });
  const [contacts, setContacts] = useState({ phone: '', wechat: '', discord: '' });
  const [errors, setErrors] = useState({});
  const [submissionFailed, setSubmissionFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [application, setApplication] = useState(null);
  const formRef = useRef(null);
  const successRef = useRef(null);
  const failureRef = useRef(null);
  const returningToFormRef = useRef(false);
  const submittingRef = useRef(false);
  const requestRef = useRef(null);
  const submissionAttemptRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (application) successRef.current?.focus();
    else if (submissionFailed) failureRef.current?.focus();
    else if (returningToFormRef.current) {
      formRef.current?.querySelector('[name="teamName"]')?.focus();
      returningToFormRef.current = false;
    }
  }, [application, submissionFailed]);

  function checkField(name, nextValues = values, nextContacts = contacts) {
    const validationErrors = validateApplication({ ...nextValues, contacts: nextContacts });
    setErrors(current => ({ ...current, [name]: validationErrors[name], ...(Object.hasOwn(CONTACT_METHODS, name) && (attemptedSubmit || current.contacts) ? { contacts: validationErrors.contacts } : {}) }));
  }

  function changeField(name, value) {
    if (value !== values[name]) submissionAttemptRef.current = null;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (errors[name]) checkField(name, nextValues);
  }

  function changeContact(method, value) {
    if (value !== contacts[method]) submissionAttemptRef.current = null;
    const nextContacts = { ...contacts, [method]: value };
    setContacts(nextContacts);
    const validationErrors = validateApplication({ ...values, contacts: nextContacts });
    setErrors(current => ({ ...current, contacts: current.contacts ? validationErrors.contacts : undefined, [method]: current[method] ? validationErrors[method] : undefined }));
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    const payload = { ...values, contacts };
    const validationErrors = validateApplication(payload);
    setAttemptedSubmit(true);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      const firstError = Object.keys(validationErrors)[0];
      const fieldName = firstError === 'contacts' ? 'phone' : firstError;
      formRef.current?.querySelector(`[name="${fieldName}"]:not(:disabled)`)?.focus();
      return;
    }
    if (!ONLINE_SUBMISSION_ENABLED) {
      setSubmissionFailed(true);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const attempt = prepareSubmissionAttempt(payload, submissionAttemptRef.current);
      submissionAttemptRef.current = attempt;
      const response = await fetch(import.meta.env.VITE_EVAL_API_URL?.trim() || '/api/evaluation-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.key },
        body: attempt.body,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (response.status === 503 && result?.code === 'SUBMISSIONS_PAUSED') {
        throw new Error('Application intake is temporarily paused. Please try again later, or join the evaluation community.');
      }
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'Your application could not be submitted. Please try again, or contact us through the community.');
      if (typeof result?.applicationId !== 'string' || typeof result?.submittedAt !== 'string') throw new Error('Your submission could not be confirmed. Please try again.');
      submissionAttemptRef.current = null;
      setApplication(result);
    } catch {
      setSubmissionFailed(true);
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      requestRef.current = null;
      setSubmitting(false);
    }
  }

  function returnToForm() {
    returningToFormRef.current = true;
    setSubmissionFailed(false);
  }

  const resultClass = application ? ' is-submitted' : submissionFailed ? ' is-failed' : '';
  const applicationDetails = [
    'RoboValue Evaluation Request',
    '',
    ...BASIC_FIELDS.map(field => `${field.label}: ${values[field.name].trim()}`),
    ...Object.entries(CONTACT_METHODS)
      .filter(([key]) => contacts[key].trim())
      .map(([key, method]) => `${method.fieldLabel}: ${contacts[key].trim()}`),
  ].join('\n');

  function renderBasicField(field) {
    return <div className={`eval-field${field.name === 'modelName' ? ' eval-field-wide' : ''}`} key={field.name}>
      <label htmlFor={`eval-${field.name}`}>{field.label}<span className="eval-required" aria-hidden="true">*</span></label>
      <input id={`eval-${field.name}`} name={field.name} type={field.type || 'text'} value={values[field.name]} onChange={event => changeField(field.name, event.target.value)} onBlur={() => checkField(field.name)} required maxLength={field.maxLength} autoComplete={field.autoComplete} placeholder={field.placeholder} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `eval-${field.name}-error` : undefined} />
      {errors[field.name] && <p className="eval-field-error" id={`eval-${field.name}-error`}>{errors[field.name]}</p>}
    </div>;
  }

  return <main className={`eval-page${resultClass}`} id="main-content" tabIndex={-1}>
    {!resultClass && <header className="eval-heading">
      <h1>Apply for Evaluation</h1>
      <p className="eval-lede">Submit your team and model details to request an evaluation.<br className="eval-intro-break" /> Our team will contact you to coordinate the next steps.</p>
    </header>}

    <div className={`eval-layout${resultClass}`}>
      <section className={`eval-application${resultClass}`} aria-labelledby={application ? 'eval-success-heading' : submissionFailed ? 'eval-failure-heading' : 'eval-form-heading'}>
        {application ? <EvaluationSuccess successRef={successRef} /> : submissionFailed ? <EvaluationFailure headingRef={failureRef} details={applicationDetails} onBack={returnToForm} /> : <>
          <div className="eval-form-heading"><h2 id="eval-form-heading">Application Details</h2><p><span aria-hidden="true">*</span> Required</p></div>
          <form ref={formRef} className="eval-form" onSubmit={submitApplication} noValidate aria-busy={submitting}>
            <fieldset className="eval-form-fields" disabled={submitting}>
              <legend className="sr-only">Application information</legend>
              <section className="eval-form-section" aria-labelledby="eval-team-heading">
                <h3 id="eval-team-heading">Team &amp; Model</h3>
                <div className="eval-field-grid">
                  {BASIC_FIELDS.filter(field => field.name !== 'email').map(renderBasicField)}
                </div>
              </section>
              <section className="eval-contact-group eval-form-section" aria-labelledby="eval-contact-heading">
                <h3 id="eval-contact-heading">Contact Information</h3>
                {renderBasicField(BASIC_FIELDS.find(field => field.name === 'email'))}
                <fieldset className="eval-contact-method" aria-describedby={errors.contacts ? 'eval-contacts-error' : undefined}>
                  <legend>Please provide at least one additional contact method.</legend>
                  <div className="eval-contact-grid">
                    {Object.entries(CONTACT_METHODS).map(([key, method]) => <div className="eval-field" key={key}>
                      <label htmlFor={`eval-contact-${key}`}>{method.fieldLabel}</label>
                      <input id={`eval-contact-${key}`} name={key} type={method.type || 'text'} value={contacts[key]} placeholder={method.placeholder} onChange={event => changeContact(key, event.target.value)} onBlur={() => checkField(key)} maxLength={method.maxLength} autoComplete={method.autoComplete} autoCapitalize="none" spellCheck={false} aria-invalid={!!errors[key] || !!errors.contacts} aria-describedby={[errors[key] && `eval-${key}-error`, errors.contacts && 'eval-contacts-error'].filter(Boolean).join(' ') || undefined} />
                      {errors[key] && <p className="eval-field-error" id={`eval-${key}-error`}>{errors[key]}</p>}
                    </div>)}
                  </div>
                  {errors.contacts && <p className="eval-field-error" id="eval-contacts-error">{errors.contacts}</p>}
                </fieldset>
              </section>
            </fieldset>
            {attemptedSubmit && Object.values(errors).some(Boolean) && <p className="eval-validation-summary" role="alert">Please check the highlighted fields before submitting.</p>}
            <div className="eval-form-footer">
              <button className="eval-submit" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Application'}{!submitting && <Icon size={20} />}</button>
            </div>
          </form>
        </>}
      </section>
      {!resultClass && <EvaluationCommunity />}
    </div>
  </main>;
}
