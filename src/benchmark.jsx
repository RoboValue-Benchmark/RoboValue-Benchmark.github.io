import React, { useRef, useState } from 'react';
import { GROUPS, METRICS } from './benchmark-metrics';

function Icon({ name = 'arrow', size = 18, ...props }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    down: <><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" /></>,
    paper: <><path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8M8 16h8" /></>,
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
    <Figure className="protocol-figure" src="/assets/overview-public.png" alt="RoboValue evaluation framework with shared interfaces and four capability dimensions" caption="Shared scalar, pairwise, and textual interfaces connect diverse value models to a unified diagnostic protocol." />
    <div className="metric-guide">{GROUPS.map(g => <div className="metric-family" key={g.id} style={{ '--group-color': g.color }}><h3>{g.title}</h3>{g.metrics.map(k => <details id={`metric-${k}`} key={k}><summary><span className="metric-symbol">{METRICS[k].label} {METRICS[k].lower ? '↓' : '↑'}</span><span>{METRICS[k].name}</span><span className="plus">+</span></summary><p>{METRICS[k].description}</p></details>)}{g.id === 'understanding' && <details id="metric-sia"><summary><span className="metric-symbol">SIA ↑</span><span>Subtask Identification Accuracy</span><span className="plus">+</span></summary><p>Models generate a description of the current subtask without seeing the candidate labels. A separate LLM judge assigns probability to the annotated subtask; SIA aggregates these probabilities geometrically within each task. It is reported separately from the aggregate leaderboard.</p></details>}</div>)}</div>
    <p className="protocol-note">Scores are averaged over applicable tasks within each domain, with simulation and the real world given equal weight. TRR and CSVC are reported only for the standard ID setting. A separate Full-Data Track is planned; the current leaderboard reports zero-shot and one-shot results.</p>
    <p className="protocol-note">Metric definitions appear in Section 4.3; aggregate scoring is specified in Appendix F.3. Subtask Identification Accuracy (SIA) is reported separately and is not included in the aggregate leaderboard.</p>
  </section>;
}



export { GROUPS, Figure, Icon, Diagnostics, Protocol };
