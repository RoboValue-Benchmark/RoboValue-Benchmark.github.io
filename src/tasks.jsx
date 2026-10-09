import React from 'react';
import taskData from './data/tasks.json';
import { Figure } from './benchmark';
import './tasks.css';

export const tasks = taskData.tasks;
export const taskPath = task => `/doc/${task.domain}-tasks/${task.slug}/`;

const DOMAINS = {
  simulation: {
    name: 'Simulation', count: 15,
    introduction: 'The simulation test set includes dual-arm manipulation tasks adapted from RoboDojo, with diverse configurations and execution conditions in Isaac Sim.',
    standard: 'ARX is the standard embodiment in Isaac Sim.',
    embodiment: 'UR5e is the shifted embodiment, testing generalization across robot morphology and execution patterns.',
    environment: 'Tabletop and floor materials, distractor objects, and lighting are varied to test generalization across visual conditions.',
    skills: 'Pick, place, fold, hand over, carry, grasp, hang, move, press, close, insert, lift, sweep, stack, and throw.',
  },
  'real-world': {
    name: 'Real-World', count: 20,
    introduction: 'The real-world test set captures dual-arm manipulation under realistic visual and interaction conditions.',
    standard: 'AgiBot Genie02 is the standard embodiment.',
    embodiment: 'ARX is the shifted embodiment, testing generalization across robot morphology and execution patterns under real-world conditions.',
    environment: 'Tablecloth color, lighting direction and tone, and distractor objects are varied to test generalization across real-world visual conditions.',
    skills: 'Cap, insert, place, open, align, close, unplug, cover, rotate, stack, press, shake, pick, strike, and pour.',
  },
};

function TaskLinks({ domain }) {
  return <div className="home-text-links task-links"><a href={`/doc/${domain}-tasks/catalog/`}>Browse all tasks →</a><a href="/doc/get-started/data/">Dataset Overview →</a></div>;
}

export function TaskOverview({ domain }) {
  const info = DOMAINS[domain];
  return <div className="task-content">
    <p className="doc-lead">{info.introduction} Evaluation covers standard, cross-embodiment, and cross-environment settings.</p>
    <Figure src={`/assets/tasks/${domain === 'real-world' ? 'real-world-diagnostics' : 'simulation-overview'}.webp`} alt={domain === 'real-world' ? 'Real-world diagnostic examples: failure and recovery, recurring states, valid solutions, and distribution shifts' : 'Simulation task coverage and diagnostic execution patterns'} caption={domain === 'real-world' ? 'Representative real-world diagnostic trajectories and distribution shifts.' : 'Simulation task coverage and representative diagnostic execution patterns.'} />
    <TaskLinks domain={domain} />
    <section className="task-section"><h2>Trajectory design</h2><p>The test split complements expert demonstrations with diagnostic execution patterns, grouped below. Coverage varies by task; training demonstrations are collected separately under standard conditions.</p>
      <dl className="trajectory-types">
        <div><dt>Expert Demonstrations</dt><dd>The robot executes the task fluently and without errors.</dd></div>
        <div><dt>Failure and Recovery</dt><dd>After an execution error, the robot continues without recovery (Error Continuation), successfully recovers (Effective Recovery), or makes an unsuccessful recovery attempt and continues (Ineffective Recovery).</dd></div>
        <div><dt>Long-Horizon Temporal</dt><dd>Repeated actions revisit visually similar states with different execution histories.</dd></div>
        <div><dt>Multi-Solution</dt><dd>Alternative valid subtask orders complete the task while respecting its dependencies.</dd></div>
      </dl>
    </section>
    <section className="task-section"><h2>Evaluation conditions</h2><p>These conditions follow the same evaluation protocol. Each distribution shift varies either the embodiment or the environment relative to the standard setting.</p>
      <dl className="condition-descriptions"><div><dt>Standard (ID)</dt><dd>{info.standard}</dd></div><div><dt>Cross-Embodiment (EMB-OOD)</dt><dd>{info.embodiment}</dd></div><div><dt>Cross-Environment (ENV-OOD)</dt><dd>{info.environment}</dd></div></dl>
    </section>
    <section className="task-section"><h2>Manipulation skills</h2><p>Representative skills include {info.skills.charAt(0).toLowerCase() + info.skills.slice(1)}</p></section>
    <section className="task-section"><h2>Task specifications</h2><p>Each task page includes its instruction, scene and procedure, subtask decomposition, representative views under each evaluation condition, and execution keyframes. Counterfactual changes are provided for the tasks covered by that evaluation.</p><a className="inline-link" href={`/doc/${domain}-tasks/catalog/`}>View the task catalog →</a></section>
  </div>;
}

export function TaskCatalog({ domain }) {
  const list = tasks.filter(t => t.domain === domain);
  return <div className="task-content"><p className="doc-lead">Select a {domain === 'simulation' ? 'simulation' : 'real-world'} task to view its instruction, subtask decomposition, and evaluation examples.</p>
    <div className="task-catalog">{list.map(t => <a className="task-card" href={taskPath(t)} key={t.id}><img src={t.images.id} alt={`${t.title}, standard setting`} width="640" height="480" loading="lazy" /><div><h2>{t.title}</h2><p>{t.instruction}</p><span>View task →</span></div></a>)}</div>
  </div>;
}

export function TaskDetail({ taskId }) {
  const task = tasks.find(t => t.id === taskId);
  return <div className="task-content">
    <section className="task-section first"><h2>Instruction</h2><blockquote className="task-instruction">{task.instruction}</blockquote></section>
    <section className="task-section"><h2>Evaluation conditions</h2><div className="task-condition-images">{[['id', 'Standard (ID)'], ['emb', 'Cross-Embodiment (EMB-OOD)'], ['env', 'Cross-Environment (ENV-OOD)']].map(([key, label]) => <Figure key={key} src={task.images[key]} alt={`${task.title}: ${label}`} caption={label} />)}</div></section>
    <section className="task-section"><h2>Scene and procedure</h2><dl className="task-specification"><div><dt>Scene</dt><dd>{task.scene}</dd></div><div><dt>Procedure</dt><dd>{task.procedure}</dd></div>{task.order && <div><dt>Order and variations</dt><dd>{task.order}</dd></div>}</dl></section>
    <section className="task-section"><h2>Subtask decomposition</h2><p className="task-hint">Subtask labels reproduce the manuscript’s decomposition. For tasks with alternative valid orders, the listed procedure does not impose additional ordering constraints beyond the instruction.</p><ol className="subtask-list">{task.subtasks.map(s => <li key={s.id}><span>{s.id}</span><p>{s.text}</p></li>)}</ol></section>
    <section className="task-section"><h2>Execution example</h2><p>Representative keyframes from a successful execution, in chronological order.</p><div className="task-sequence" role="region" tabIndex={0} aria-label={`${task.title}: seven execution frames`}>{task.sequence.map((src, i) => <figure key={src}><img src={src} alt={`${task.title}: execution sample ${i + 1} of 7`} loading="lazy" /><figcaption>{String(i + 1).padStart(2, '0')}</figcaption></figure>)}</div></section>
    <section className="task-section"><h2>Counterfactual instruction changes</h2>{task.counterfactual ? <><p>TGA-CF holds the successful trajectory fixed and changes the instruction. The summaries below describe the semantic changes; they are not complete counterfactual prompts. Each category names the primary change, and related semantics may also change.</p><dl className="counterfactual-changes">{Object.entries(task.counterfactual.changes).map(([category, value]) => { const [original, changed] = value.split(' → '); return <div key={category}><dt>{category}</dt><dd><span>{original}</span><span className="change-arrow" aria-label="changed to"> → </span><strong>{changed}</strong></dd></div>; })}</dl></> : <p>This task is omitted from the paired counterfactual instruction set in the manuscript and is reserved for history-dependent progress evaluation.</p>}</section>
    <p className="task-source">Task specifications: Appendix {task.source.appendix}. Execution examples: Appendix {task.domain === 'simulation' ? 'C.5' : 'D.5'}{task.counterfactual ? `. Counterfactual changes: Appendix ${task.domain === 'simulation' ? 'C.3' : 'D.3'}` : ''}.</p>
    <TaskLinks domain={task.domain} />
  </div>;
}
