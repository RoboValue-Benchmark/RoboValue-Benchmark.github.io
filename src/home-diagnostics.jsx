import React, { useState } from 'react';
import { Figure, Icon } from './benchmark';
import { GROUPS, METRICS } from './benchmark-metrics';
import taskData from './data/tasks.json';

const mugTask = taskData.tasks.find(task => task.id === 'simulation/hang-mugs');
const QUESTIONS = {
  understanding: ['Same execution. Different instructions.', 'Does the value reflect what was actually asked?'],
  tracking: ['Progress has a direction and a history.', 'Can the value follow more than elapsed time?'],
  diagnosis: ['A recovery attempt is only part of the story.', 'Can the value distinguish the attempt from its outcome?'],
  consistency: ['Different orders. Comparable achievements.', 'Does the same subtask receive consistent credit?'],
};

function Filmstrip({ frames }) {
  return <div className="rv-filmstrip">{frames.map((frame, index) => <figure key={`${frame.src}-${index}`}><img src={frame.src} alt={frame.alt || frame.label} width="640" height="480" loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')}</span>{frame.label}</figcaption></figure>)}</div>;
}

function UnderstandingExample() {
  const [instruction, setInstruction] = useState('original');
  return <><Filmstrip frames={[0, 3, 6].map(index => ({ src: mugTask.sequence[index], label: `Keyframe ${index + 1} of 7`, alt: `Hang Mugs expert execution, keyframe ${index + 1}` }))} /><div className="rv-instruction-choices" role="group" aria-label="Instruction shown">{[
    ['original', 'Original instruction', mugTask.instruction],
    ['counterfactual', 'Changed constraint', 'Hang exactly two mugs on the mug rack and leave the remaining mug on the table.'],
  ].map(([id, label, text]) => <button type="button" key={id} aria-pressed={instruction === id} onClick={() => setInstruction(id)}><span>{label}<i aria-hidden="true">{instruction === id ? '●' : '○'}</i></span><strong>{text}</strong></button>)}</div><p className="rv-example-observation" aria-live="polite">{instruction === 'original' ? 'The expert execution satisfies the original instruction. Its value gain should exceed that under the changed constraint.' : 'The images stay the same, but “exactly two” changes the task requirement. A grounded model should respond to that difference.'}</p></>;
}

function ExpectedTrend({ memory = false }) {
  return <figure className="rv-expected-trend"><figcaption>Schematic · expected value trend</figcaption><svg viewBox="0 0 520 132" role="img" aria-label={memory ? 'Expected progress increases as the required actions are completed, even when similar images recur.' : 'Expected value rises during forward execution and falls during reversed playback.'}><path d="M25 12v88h475" fill="none" stroke="#d8d1e4" strokeWidth="1.5" />{memory ? <><path d="M35 89 140 74 245 57 350 41 490 21" fill="none" stroke="#267d91" strokeWidth="3" strokeLinejoin="round" /><text x="270" y="122" textAnchor="middle">More completed actions →</text></> : <><path d="M260 10v90" fill="none" stroke="#d8d1e4" strokeDasharray="4 5" /><path d="M35 89 105 69 180 39 260 18 337 40 417 70 490 89" fill="none" stroke="#267d91" strokeWidth="3" strokeLinejoin="round" /><text x="145" y="122" textAnchor="middle">Forward playback</text><text x="380" y="122" textAnchor="middle">Reversed playback</text></>}</svg></figure>;
}

function TrackingExample() {
  const [scenario, setScenario] = useState('cycle');
  const memory = scenario === 'memory';
  const files = memory ? ['button-1', 'button-2', 'button-3', 'button-4', 'button-5'] : ['pen-1', 'pen-2', 'pen-3', 'pen-2', 'pen-1'];
  const labels = memory ? ['2.24 s', '3.00 s', '3.72 s', '4.48 s', '5.08 s'] : ['Forward', 'Forward', 'Turning point', 'Reverse', 'Reverse'];
  return <><div className="rv-small-switch" role="group" aria-label="Temporal diagnostic"><button type="button" aria-pressed={!memory} onClick={() => setScenario('cycle')}>Progress reversal</button><button type="button" aria-pressed={memory} onClick={() => setScenario('memory')}>Execution history</button></div><Filmstrip frames={files.map((file, index) => ({ src: `/assets/${file}.png`, label: labels[index], alt: `${memory ? 'Press by number' : 'Fill pen holder'}: ${labels[index]}` }))} /><ExpectedTrend memory={memory} /><p className="rv-example-observation">{memory ? 'Repeated actions revisit similar visual states. Memory-VOC tests progress tracking on these trajectories; read it alongside the other temporal diagnostics.' : 'Cycle-VOC follows one forward–reverse sequence with its context retained. Reversed playback is a controlled visual test and need not be physically executable.'}</p></>;
}

function RecoveryExample() {
  return <div className="rv-diagnostic-pair"><Figure className="rv-sheet-crop rv-sheet-recovery" src="/assets/tasks/real-world-diagnostics.webp" alt="Real-world flower-arranging examples of effective recovery, ineffective recovery, and error continuation" caption="Three responses to an execution error · Real world" /><div className="rv-recovery-stages"><p className="rv-small-label">EXPECTED STAGE-WISE TRENDS</p>{[
    ['Effective recovery', 'Failure ↓', 'Attempt ↑', 'Outcome ↑', 'effective'],
    ['Ineffective recovery', 'Failure ↓', 'Attempt ↑', 'Outcome ↓', 'ineffective'],
    ['Error continuation', 'Failure ↓', 'Continued error → / ↓', null, 'continuation'],
  ].map(([label, failure, attempt, outcome, style]) => <div key={label} className={`rv-recovery-stage ${style}`}><h4>{label}</h4><p><span>{failure}</span><span>{attempt}</span>{outcome && <span>{outcome}</span>}</p></div>)}<p className="rv-stage-note">FPL locates the failure onset. TRR checks the failure, corrective attempt, and outcome as separate stages.</p></div></div>;
}

function ConsistencyExample() {
  return <div className="rv-diagnostic-pair"><Figure className="rv-sheet-crop rv-sheet-solutions" src="/assets/tasks/real-world-diagnostics.webp" alt="Three valid desktop-workstation execution orders, with pen, eraser, drawer, and lamp subtasks" caption="Alternative valid executions · Real world" /><div className="rv-consistency-explanation"><p className="rv-small-label">SEMANTIC SUBTASK CREDIT</p><h4>Match the achievement,<br />even when its position changes.</h4><p>CSVC compares the value gains for the same semantic subtask across valid solutions. Each solution still respects the task’s dependencies.</p><div className="rv-gain-example"><span>Expected consistency</span><strong>ΔV<sub>A</sub>(Pen) ≈ ΔV<sub>B</sub>(Pen)</strong></div><p className="rv-stage-note">VS additionally assesses stable, informative trends. Interpret consistency alongside progress tracking.</p></div></div>;
}

export function HomeDiagnostics() {
  const [selected, setSelected] = useState('understanding');
  const group = GROUPS.find(group => group.id === selected);
  const [title, question] = QUESTIONS[selected];
  const onTabKey = (event, index) => {
    const offset = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
    if (!offset && !['Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? GROUPS.length - 1 : (index + offset + GROUPS.length) % GROUPS.length;
    setSelected(GROUPS[next].id);
    document.getElementById(`capability-tab-${GROUPS[next].id}`).focus();
  };
  return <section className="rv-section rv-benchmark" id="benchmark" aria-labelledby="benchmark-title"><div className="rv-section-heading"><div><p className="rv-eyebrow">WHAT DOES A VALUE MODEL UNDERSTAND?</p><h2 id="benchmark-title">Four capabilities. A finer view of execution.</h2></div><p>Outcome accuracy and forward progress tell part of the story. RoboValue also tests instructions, execution history, recovery, and consistent subtask credit.</p></div><div className="rv-capability-explorer"><div className="rv-capability-tabs" role="tablist" aria-label="Capability examples">{GROUPS.map((item, index) => <button type="button" role="tab" key={item.id} id={`capability-tab-${item.id}`} aria-selected={selected === item.id} aria-controls="capability-panel" tabIndex={selected === item.id ? 0 : -1} onClick={() => setSelected(item.id)} onKeyDown={event => onTabKey(event, index)} style={{ '--capability-color': item.color }}><span className="rv-tab-number">0{index + 1}</span><span><strong>{item.short}</strong><small>{item.title}</small></span><Icon size={16} /></button>)}</div><div className="rv-capability-panel" role="tabpanel" id="capability-panel" aria-labelledby={`capability-tab-${selected}`} tabIndex={0} style={{ '--capability-color': group.color }}><div className="rv-example-heading"><p>{question}</p><h3>{title}</h3></div>{selected === 'understanding' && <UnderstandingExample />}{selected === 'tracking' && <TrackingExample />}{selected === 'diagnosis' && <RecoveryExample />}{selected === 'consistency' && <ConsistencyExample />}<div className="rv-example-metrics"><span>Explore the metrics</span><div>{group.metrics.map(key => <a key={key} href={`/doc/get-started/protocol/#metric-${key}`}>{METRICS[key].label}<Icon size={13} /></a>)}{selected === 'understanding' && <a href="/doc/get-started/protocol/#metric-sia">SIA · separate evaluation<Icon size={13} /></a>}</div></div></div></div></section>;
}
