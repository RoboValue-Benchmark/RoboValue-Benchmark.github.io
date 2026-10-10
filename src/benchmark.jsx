import React, { useRef, useState } from 'react';
import { GROUPS, METRICS } from './benchmark-metrics';

function Icon({ name = 'arrow', size = 18, ...props }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chevron: <path d="m9 6 6 6-6 6" />,
    down: <><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" /></>,
    paper: <><path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8M8 16h8" /></>,
    archive: <><path d="M4 3h16v4H4zM5 7v14h14V7M9 11h6" /></>,
    github: <path fill="currentColor" stroke="none" d="M12 .8a11.3 11.3 0 0 0-3.57 22.02c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.73 1.17 1.73 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.51-.28-5.15-1.25-5.15-5.59 0-1.24.45-2.24 1.16-3.04-.11-.29-.5-1.44.11-2.99 0 0 .95-.3 3.11 1.16a10.8 10.8 0 0 1 5.66 0c2.16-1.46 3.11-1.16 3.11-1.16.62 1.55.23 2.7.12 2.99.72.8 1.16 1.8 1.16 3.04 0 4.35-2.65 5.3-5.18 5.58.41.35.77 1.04.77 2.1v3.08c0 .3.21.65.78.54A11.3 11.3 0 0 0 12 .8Z" />,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" /></>,
    leaderboard: <><path d="M3 21h18M5 21V11h4v10M10 21V4h4v17M15 21v-7h4v7" /></>,
    trophy: <><path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H3v2a4 4 0 0 0 4 4M17 5h4v2a4 4 0 0 1-4 4M12 14v4M8 21v-3h8v3M6 21h12" /></>,
    book: <><path d="M12 5v16M3 3h5c2 0 4 1 4 2 0-1 2-2 4-2h5v16h-5c-2 0-4 1-4 2 0-1-2-2-4-2H3z" /></>,
    users: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5" /></>,
    conversation: <><path d="M18 10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1v4l4-4M12 10h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-3-3h-3a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2ZM7 7h6" /></>,
    external: <path d="M7 17 17 7M7 7h10v10" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V3H3v13h5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function Figure({ src, alt, caption, className = '' }) {
  const dialog = useRef(null);
  return <figure className={`paper-figure ${className}`}>
    <button className="figure-open" onClick={() => dialog.current.showModal()} aria-label={`Enlarge: ${alt}`}>
      <img src={src} alt={alt} loading="lazy" /><span className="expand"><Icon name="expand" /> Enlarge figure</span>
    </button>
    {caption && <figcaption>{caption}</figcaption>}
    <dialog ref={dialog} className="figure-dialog" onClick={e => { if (e.target === e.currentTarget) dialog.current.close(); }}>
      <button className="close-dialog" aria-label="Close figure" onClick={() => dialog.current.close()}><Icon name="close" /></button>
      <img src={src} alt={alt} /><p>{caption}</p>
    </dialog>
  </figure>;
}

function SectionTitle({ eyebrow, title, children }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children && <p className="section-description">{children}</p>}</div>;
}

const EXAMPLES = [
  { id: 'cycle', label: 'Progress & regression', metric: 'CYCLE-VOC', title: 'Tracking progress and regression.', description: 'An expert trajectory is followed by its reversed sequence. A reliable value model should respond to task regression, even though presentation time keeps increasing.', files: ['pen-1', 'pen-2', 'pen-3', 'pen-2', 'pen-1'], labels: ['Forward', 'Forward', 'Turning point', 'Reverse', 'Reverse'], task: 'Fill pen holder · Simulation', question: 'Does the value track execution direction?' },
  { id: 'memory', label: 'Execution history', metric: 'MEMORY-VOC', title: 'Tracking progress through repeated actions.', description: 'Repeated actions bring the robot back to visually similar states. The current image alone may not reveal how much of the requested sequence has been completed.', files: ['button-1', 'button-2', 'button-3', 'button-4', 'button-5'], labels: ['2.24 s', '3.00 s', '3.72 s', '4.48 s', '5.08 s'], task: 'Press by number · Simulation', question: 'Does the model remember the completed actions?' },
  { id: 'recovery', label: 'Failure & recovery', metric: 'TRR', title: 'Distinguishing recovery attempts from outcomes.', description: 'This example shows an execution error, an unsuccessful recovery attempt, and a transition to the next subtask. TRR tests whether value changes reflect the failure, attempt, and outcome.', files: ['fold-1', 'fold-2', 'fold-3', 'fold-4', 'fold-5'], labels: ['Before failure', 'After failure', 'Recovery attempt', 'Recovery fails', 'Next subtask'], task: 'Fold clothes · Simulation', question: 'Does the value reflect the recovery outcome?' },
];

function Diagnostics() {
  const [selected, setSelected] = useState('cycle');
  const e = EXAMPLES.find(e => e.id === selected);
  return <section id="diagnostics" className="section wrap">
    <SectionTitle eyebrow="TRAJECTORY EXAMPLES" title="A closer look at execution.">Three examples illustrate how RoboValue tests progress reversal, execution history, and recovery outcomes.</SectionTitle>
    <div className="example-tabs" role="group" aria-label="Diagnostic example">{EXAMPLES.map(e => <button key={e.id} aria-pressed={e.id === selected} onClick={() => setSelected(e.id)}>{e.label}</button>)}</div>
    <div className="example-panel"><div className="example-intro"><span className="mini-label">{e.metric}</span><h3>{e.title}</h3><p>{e.description}</p></div><div className="filmstrip">{e.files.map((file, i) => <figure key={`${selected}-${i}`}><img src={`/assets/${file}.png`} loading="lazy" alt={`${e.task}: ${e.labels[i]}`} /><figcaption><span>0{i + 1}</span>{e.labels[i]}</figcaption></figure>)}</div><div className="example-footer"><span>{e.task}</span><strong>{e.question}</strong></div></div>
  </section>;
}

function Protocol() {
  return <section id="protocol" className="section wrap"><SectionTitle eyebrow="EVALUATION" title="Protocol and metrics.">Model-specific adapters provide shared scalar, pairwise, and textual interfaces while preserving each model’s native value semantics.</SectionTitle>
    <div className="setting-explainer"><div><span>ZERO-SHOT</span><p>Released checkpoints, without task-specific adaptation or reference demonstrations.</p></div><div><span>ONE-SHOT</span><p>One standard-scenario training demonstration per task, kept separate from test trajectories, used for conditioning or task-specific adaptation.</p></div><div><span>GENERALIZATION</span><p>Change the embodiment or environment without further adaptation to the shifted condition.</p></div></div>
    <Figure className="protocol-figure" src="/assets/benchmark-overview.svg" alt="RoboValue evaluation framework with shared interfaces and four capability dimensions" caption="Shared scalar, pairwise, and textual interfaces connect diverse value models to a unified diagnostic protocol." />
    <div className="metric-guide">{GROUPS.map(g => <div className="metric-family" key={g.id} style={{ '--group-color': g.color }}><h3>{g.title}</h3>{g.metrics.map(k => <details id={`metric-${k}`} key={k}><summary><span className="metric-symbol">{METRICS[k].label} {METRICS[k].lower ? '↓' : '↑'}</span><span>{METRICS[k].name}</span><span className="plus">+</span></summary><p>{METRICS[k].description}</p></details>)}{g.id === 'understanding' && <details id="metric-sia"><summary><span className="metric-symbol">SIA ↑</span><span>Subtask Identification Accuracy</span><span className="plus">+</span></summary><p>Models generate a description of the current subtask without seeing the candidate labels. A separate LLM judge assigns probability to the annotated subtask; SIA aggregates these probabilities geometrically within each task. It is reported separately from the aggregate leaderboard.</p></details>}</div>)}</div>
    <p className="protocol-note">Scores are averaged over applicable tasks within each domain, with simulation and the real world given equal weight. TRR and CSVC are reported only for the standard ID setting. A separate Full-Shot Track is planned; the current leaderboard reports zero-shot and one-shot results.</p>
    <p className="protocol-note">Metric definitions appear in Section 4.3; aggregate scoring is specified in Appendix F.3. Subtask Identification Accuracy (SIA) is reported separately and is not included in the aggregate leaderboard.</p>
  </section>;
}



export { GROUPS, Figure, Icon, Diagnostics, Protocol };
