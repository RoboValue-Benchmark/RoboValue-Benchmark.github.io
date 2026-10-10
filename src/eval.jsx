import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './benchmark';
import { DISCORD_INVITE } from './community';
import './eval.css';

const BASIC_FIELDS = [
  { name: 'teamName', label: 'Team Name', maxLength: 120, autoComplete: 'off' },
  { name: 'organization', label: 'Organization', maxLength: 160, autoComplete: 'organization' },
  { name: 'modelName', label: 'Model Name', maxLength: 160, placeholder: 'Model name and version', autoComplete: 'off' },
  { name: 'email', label: 'Email', type: 'email', maxLength: 254, autoComplete: 'email' },
];
const CONTACT_METHODS = {
  phone: { label: 'Phone', fieldLabel: 'Phone Number', type: 'tel', maxLength: 40, autoComplete: 'tel', placeholder: 'Country code + phone number' },
  wechat: { label: 'WeChat', fieldLabel: 'WeChat ID', maxLength: 64, autoComplete: 'off' },
  discord: { label: 'Discord', fieldLabel: 'Discord Username', maxLength: 32, autoComplete: 'off' },
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
    <p className="eval-community-intro">Join us to discuss model integration and the next steps for evaluation.</p>
    <section className="eval-channel" aria-labelledby="eval-wechat-heading">
      <h3 id="eval-wechat-heading">WeChat</h3>
      <p>Scan to join the RoboValue evaluation group.</p>
      <a className="eval-qr" href="/assets/evaluation-wechat.png" target="_blank" rel="noopener noreferrer" aria-label="Open the evaluation WeChat QR code at full size">
        <img src="/assets/evaluation-wechat.png" width="540" height="830" alt="RoboValue evaluation WeChat group QR code, valid before October 18" />
      </a>
    </section>
    <section className="eval-channel eval-discord" aria-labelledby="eval-discord-heading">
      <h3 id="eval-discord-heading">Discord</h3>
      <p>Connect with the team and other participants.</p>
      <a className="eval-community-link" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join Discord<Icon size={20} /></a>
    </section>
    <p className="eval-community-note">Introduce your team when you join.</p>
  </aside>;
}

export function EvaluationPage() {
  const [values, setValues] = useState({ teamName: '', organization: '', modelName: '', email: '' });
  const [contacts, setContacts] = useState({ phone: '', wechat: '', discord: '' });
  const [contactMethod, setContactMethod] = useState('wechat');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [application, setApplication] = useState(null);
  const formRef = useRef(null);
  const successRef = useRef(null);
  const submittingRef = useRef(false);
  const requestRef = useRef(null);
  const contactFocusRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (application) successRef.current?.focus();
  }, [application]);
  useEffect(() => {
    if (contactFocusRef.current) {
      formRef.current?.querySelector(`[name="${contactFocusRef.current}"]`)?.focus();
      contactFocusRef.current = null;
    }
  }, [contactMethod, errors]);

  function moveContactTab(event, method) {
    const methods = Object.keys(CONTACT_METHODS);
    const current = methods.indexOf(method);
    let next;
    if (event.key === 'ArrowRight') next = methods[(current + 1) % methods.length];
    else if (event.key === 'ArrowLeft') next = methods[(current + methods.length - 1) % methods.length];
    else if (event.key === 'Home') next = methods[0];
    else if (event.key === 'End') next = methods.at(-1);
    else return;
    event.preventDefault();
    setContactMethod(next);
    formRef.current?.querySelector(`#eval-contact-tab-${next}`)?.focus();
  }

  function checkField(name, nextValues = values, nextContacts = contacts) {
    const validationErrors = validateApplication({ ...nextValues, contacts: nextContacts });
    setErrors(current => ({ ...current, [name]: validationErrors[name], ...(Object.hasOwn(CONTACT_METHODS, name) && (attemptedSubmit || current.contacts) ? { contacts: validationErrors.contacts } : {}) }));
  }

  function changeField(name, value) {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (errors[name]) checkField(name, nextValues);
    setSubmitError('');
  }

  function changeContact(method, value) {
    const nextContacts = { ...contacts, [method]: value };
    setContacts(nextContacts);
    const validationErrors = validateApplication({ ...values, contacts: nextContacts });
    setErrors(current => ({ ...current, contacts: current.contacts ? validationErrors.contacts : undefined, [method]: current[method] ? validationErrors[method] : undefined }));
    setSubmitError('');
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    const payload = { ...values, contacts };
    const validationErrors = validateApplication(payload);
    setAttemptedSubmit(true);
    setErrors(validationErrors);
    setSubmitError('');
    if (Object.keys(validationErrors).length) {
      const firstError = Object.keys(validationErrors)[0];
      if (firstError === 'contacts' || Object.hasOwn(CONTACT_METHODS, firstError)) {
        const method = firstError === 'contacts' ? contactMethod : firstError;
        contactFocusRef.current = method;
        setContactMethod(method);
      } else {
        formRef.current.querySelector(`[name="${firstError}"]:not(:disabled)`)?.focus();
      }
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(import.meta.env.VITE_EVAL_API_URL?.trim() || '/api/evaluation-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'Your application could not be submitted. Please try again.');
      if (typeof result?.applicationId !== 'string' || typeof result?.submittedAt !== 'string') throw new Error('Your submission could not be confirmed. Please try again.');
      setApplication(result);
    } catch (error) {
      setSubmitError(error.name === 'AbortError' || error instanceof TypeError
        ? 'Your submission could not be confirmed. Your details are still here; please try again.'
        : error.message);
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      requestRef.current = null;
      setSubmitting(false);
    }
  }

  return <main className="eval-page" id="main-content" tabIndex={-1}>
    <header className="eval-heading">
      <p className="eval-eyebrow">Evaluation</p>
      <h1>Apply for Evaluation</h1>
      <p className="eval-lede">Register your team and model for evaluation on RoboValue.<br className="eval-intro-break" /> We’ll contact you to coordinate the next steps.</p>
    </header>

    <div className="eval-layout">
      <section className={`eval-application${application ? ' is-submitted' : ''}`} aria-labelledby={application ? 'eval-success-heading' : 'eval-form-heading'}>
        {application ? <div className="eval-success">
          <span className="eval-success-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg></span>
          <h2 ref={successRef} tabIndex={-1} id="eval-success-heading">Application Submitted</h2>
          <p>Thank you for your interest in RoboValue. We’ll contact you using the details provided.</p>
          <p>In the meantime, read Get Started to prepare your model for evaluation.</p>
          <a className="eval-primary-link" href="/doc/get-started/">Get Started<Icon size={20} /></a>
        </div> : <>
          <div className="eval-form-heading"><h2 id="eval-form-heading">Application Details</h2><p><span aria-hidden="true">*</span> Required fields</p></div>
          <form ref={formRef} className="eval-form" onSubmit={submitApplication} noValidate aria-busy={submitting}>
            <fieldset className="eval-form-fields" disabled={submitting}>
              <legend className="sr-only">Team and model information</legend>
              <div className="eval-field-grid">
                {BASIC_FIELDS.map(field => <div className="eval-field" key={field.name}>
                  <label htmlFor={`eval-${field.name}`}>{field.label}<span className="eval-required" aria-hidden="true">*</span></label>
                  <input id={`eval-${field.name}`} name={field.name} type={field.type || 'text'} value={values[field.name]} onChange={event => changeField(field.name, event.target.value)} onBlur={() => checkField(field.name)} required maxLength={field.maxLength} autoComplete={field.autoComplete} placeholder={field.placeholder} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `eval-${field.name}-error` : undefined} />
                  {errors[field.name] && <p className="eval-field-error" id={`eval-${field.name}-error`}>{errors[field.name]}</p>}
                </div>)}
              </div>
              <div className="eval-contact-group">
                <fieldset className="eval-contact-method" aria-describedby={errors.contacts ? 'eval-contacts-error' : undefined}>
                  <legend><span>Contact Details<span className="eval-required" aria-hidden="true">*</span></span><span className="eval-choice-hint">At least one</span></legend>
                  <div className="eval-contact-tabs" role="tablist" aria-label="Contact method">
                    {Object.entries(CONTACT_METHODS).map(([key, method]) => <button key={key} type="button" role="tab" id={`eval-contact-tab-${key}`} aria-controls={`eval-contact-panel-${key}`} aria-selected={contactMethod === key} tabIndex={contactMethod === key ? 0 : -1} className={`eval-contact-tab${contactMethod === key ? ' is-active' : ''}${errors[key] ? ' has-error' : ''}`} onClick={() => setContactMethod(key)} onKeyDown={event => moveContactTab(event, key)}>
                      {method.label}
                      {errors[key] ? <span className="eval-contact-status is-error" aria-label="Needs correction">!</span> : contacts[key].trim() ? <svg className="eval-contact-status" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Filled"><path d="m3 8 3 3 7-7" /></svg> : null}
                    </button>)}
                  </div>
                  <div className="eval-contact-panels">
                    {Object.entries(CONTACT_METHODS).map(([key, method]) => <div className="eval-contact-panel eval-field" key={key} role="tabpanel" id={`eval-contact-panel-${key}`} aria-labelledby={`eval-contact-tab-${key}`} hidden={contactMethod !== key}>
                      <label htmlFor={`eval-contact-${key}`}>{method.fieldLabel}</label>
                      <input id={`eval-contact-${key}`} name={key} type={method.type || 'text'} value={contacts[key]} placeholder={method.placeholder} onChange={event => changeContact(key, event.target.value)} onBlur={() => checkField(key)} maxLength={method.maxLength} autoComplete={method.autoComplete} autoCapitalize="none" spellCheck={false} aria-invalid={!!errors[key] || !!errors.contacts} aria-describedby={[errors[key] && `eval-${key}-error`, errors.contacts && 'eval-contacts-error'].filter(Boolean).join(' ') || undefined} />
                      {errors[key] && <p className="eval-field-error" id={`eval-${key}-error`}>{errors[key]}</p>}
                    </div>)}
                  </div>
                  {errors.contacts && <p className="eval-field-error" id="eval-contacts-error">{errors.contacts}</p>}
                </fieldset>
              </div>
            </fieldset>
            {attemptedSubmit && Object.values(errors).some(Boolean) && <p className="eval-validation-summary" role="alert">Please check the highlighted fields before submitting.</p>}
            {submitError && <p className="eval-submit-error" role="alert">{submitError}</p>}
            <div className="eval-form-footer">
              <button className="eval-submit" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Application'}{!submitting && <Icon size={20} />}</button>
              <p>We’ll use these details to coordinate your evaluation.</p>
            </div>
          </form>
        </>}
      </section>
      <EvaluationCommunity />
    </div>
  </main>;
}
