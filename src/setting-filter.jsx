import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './setting-filter.css';

const options = [
  { id: 'all', label: 'All types' },
  { id: 'zero', label: 'Zero-Shot' },
  { id: 'one', label: 'One-Shot' },
  { id: 'full', label: 'Full-Shot', disabled: true },
];

export function SettingFilter({ value, onChange, counts, tableId }) {
  const [position, setPosition] = useState(null);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const trigger = useRef(null);
  const menu = useRef(null);
  const id = useId();
  const selected = options.find(o => o.id === value) || options[0];
  const close = (focus = false) => { setPosition(null); if (focus) trigger.current?.focus(); };
  const open = () => {
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(244, window.innerWidth - 24);
    setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: rect.bottom + 8 + 252 > window.innerHeight ? Math.max(12, rect.top - 260) : rect.bottom + 8, width });
  };
  useEffect(() => {
    if (!position) return;
    menu.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
    const outside = e => { if (!menu.current?.contains(e.target) && !trigger.current?.contains(e.target)) close(); };
    const dismiss = () => close();
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', open, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('scroll', open, true);
    };
  }, [!!position]);
  const keyboard = e => {
    setKeyboardMode(true);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    if (e.key === 'Tab') close(true);
    const buttons = [...menu.current.querySelectorAll('button:not(:disabled)')];
    const index = buttons.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? (index + 1) % buttons.length : e.key === 'ArrowUp' ? (index + buttons.length - 1) % buttons.length : e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : null;
    if (next !== null) { e.preventDefault(); buttons[next].focus(); }
  };
  return <div className="lb-setting-control">
    <button ref={trigger} type="button" className={`lb-setting-trigger lb-filter-tone--${selected.id}`} aria-label={`Filter ${tableId === 'lb-results-table' ? 'Results' : 'Overall Ranking'} by setting: ${selected.label}`} aria-haspopup="menu" aria-expanded={!!position} aria-controls={position ? id : undefined} onClick={() => { setKeyboardMode(false); position ? close() : open(); }} onKeyDown={e => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setKeyboardMode(true); open(); } }}>
      <span>{selected.label}</span><svg className="lb-filter-chevron" width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    {position && createPortal(<div ref={menu} id={id} className="lb-setting-menu" data-keyboard={keyboardMode} style={position} role="menu" aria-label="Evaluation setting" onKeyDown={keyboard}>
      <div className="lb-setting-menu-heading">EVALUATION SETTING</div>
      {options.map(option => <button key={option.id} type="button" role="menuitemradio" aria-checked={value === option.id} disabled={option.disabled} tabIndex={-1} className={`lb-setting-option lb-filter-tone--${option.id}`} onClick={() => { onChange(option.id); close(true); }}>
        <span className="lb-option-dot" /><span className="lb-option-label">{option.label}</span>
        <span className="lb-option-count">{counts[option.id] || 0}</span>
      </button>)}
    </div>, document.body)}
  </div>;
}
