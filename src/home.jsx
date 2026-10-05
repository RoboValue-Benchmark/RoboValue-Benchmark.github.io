import React from 'react';
import { Figure } from './benchmark';
import './home.css';

const AUTHORS = [
  ['Shengbang Liu', '1,2,*'], ['Zhengye Du', '1,2,*'], ['Zhilong Wan', '1,2,*'], ['Honghao Su', '3,*'],
  ['Chenxiang Xia', '1'], ['Chang Ge', '4'], ['Jinyang Xiao', '4'], ['Nan Wang', '2,†'],
  ['Zhipeng Hu', '1'], ['Huining Yuan', '1'], ['Shu’ang Yu', '1'], ['Yue Chen', '3,5'],
  ['Tianxing Chen', '3,6'], ['Chuankang Li', '2'], ['Maoqing Yao', '2'], ['Wenbo Ding', '1,3'],
  ['Yu Wang', '1'], ['Guanghui Ren', '2,‡'], ['Chao Yu', '1,‡'],
];
const AFFILIATIONS = ['Tsinghua University', 'AgiBot', 'Xspark AI', 'Sun Yat-sen University', 'Peking University', 'The University of Hong Kong'];
const CAPABILITIES = [
  ['Task-State Understanding', 'Distinguish successful execution and assess whether values reflect the specified task requirements.'],
  ['Temporal Progress Monitoring', 'Track progress and regression, including recurring visual states with different execution histories.'],
  ['Failure and Recovery Reasoning', 'Locate failures and distinguish corrective attempts from their eventual outcomes.'],
  ['Value Consistency', 'Provide stable feedback within trajectories and consistent subtask gains across valid solutions.'],
];

export function PublicHome() {
  return <main className="public-home" id="main-content">
    <section className="public-hero" aria-labelledby="project-title">
      <p className="public-wordmark">RoboValue</p>
      <h1 id="project-title">A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1>
      <div className="public-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation]) => <span key={name}>{name}<sup>{affiliation}</sup></span>)}</div>
      <div className="public-affiliations" aria-label="Affiliations">{AFFILIATIONS.map((name, index) => <span key={name}><sup>{index + 1}</sup>{name}</span>)}</div>
      <p className="public-author-notes">* Equal contribution <span>·</span> † Project leader <span>·</span> ‡ Corresponding authors</p>
      <div className="public-resources" aria-label="Project resources">
        <a className="primary-resource" href="/doc/">Document <span>↗</span></a>
        <a href="/leaderboard/">Leaderboard <span>↗</span></a>
        {['Paper', 'arXiv', 'Code', 'Dataset'].map(label => <button key={label} type="button" disabled title="Public link to be added">{label}<span>Coming soon</span></button>)}
      </div>
    </section>

    <section className="public-section public-introduction" aria-labelledby="intro-title">
      <h2 id="intro-title">Overview</h2>
      <p>Robotic value models provide feedback for policy learning and execution monitoring. Yet strong outcome discrimination and forward-progress correlation alone do not establish whether this feedback captures task requirements and intermediate execution events.</p>
      <p><strong className="home-accent">RoboValue</strong> is a fine-grained sim-and-real benchmark for unified evaluation of robotic value models. Shared interfaces and model-specific adapters enable comparisons across heterogeneous models while preserving their native value semantics. Diagnostic trajectories and instruction variations test whether value judgments respond to task-relevant differences and assign consistent credit to comparable achievements.</p>
      <Figure src="/assets/overview-public.png" alt="RoboValue overview: sim-and-real evaluation data, shared model interfaces, and four capability dimensions with diagnostic execution examples" caption="RoboValue evaluates task-state understanding, temporal progress monitoring, failure and recovery reasoning, and value consistency under a shared protocol." />
      <div className="home-capabilities">{CAPABILITIES.map(([title, description], index) => <div key={title}><span className="capability-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div>
      <a className="home-section-link" href="/doc/get-started/protocol/">Explore the evaluation protocol and metrics →</a>
    </section>

    <section className="public-section" aria-labelledby="dataset-title">
      <div className="public-section-heading"><h2 id="dataset-title">Simulation and real-world execution</h2><p>Annotated trajectories expose task-state differences that successful and failed outcomes alone can overlook.</p></div>
      <p><strong className="home-accent">RoboValue-Dataset</strong> contains 2,792 evaluation trajectories across 15 simulation and 20 real-world manipulation tasks, alongside expert demonstrations for fine-tuning. Beyond fluent expert execution, the dataset includes error continuation, effective and ineffective recovery, recurring visual states with different histories, and alternative valid subtask orders.</p>
      <div className="home-task-panels">
        <a href="/doc/simulation-tasks/"><img src="/assets/sim-pen.jpeg" alt="Dual-arm fill-pen-holder task in simulation" loading="lazy" /><div><span>15 TASKS</span><h3>Simulation tasks <span>→</span></h3><p>Controlled execution scenarios and shifts in robot embodiment or environment.</p></div></a>
        <a href="/doc/real-world-tasks/"><img src="/assets/real-cosmetics.jpeg" alt="Real-world dual-arm manipulation with cosmetics" loading="lazy" /><div><span>20 TASKS</span><h3>Real-world tasks <span>→</span></h3><p>Physical execution with realistic visual conditions and object interactions.</p></div></a>
      </div>
    </section>

    <section className="public-section" aria-labelledby="evaluation-title">
      <h2 id="evaluation-title">Evaluation and results</h2>
      <p>We evaluate 15 model variants from nine families under zero-shot and one-shot settings, including standard conditions and shifts in robot embodiment or environment. Strong outcome discrimination and progress correlation can coexist with weaknesses in instruction grounding, execution memory, and recovery reasoning.</p>
      <div className="home-entry-links">
        <a href="/leaderboard/"><h3>View the leaderboard <span>→</span></h3><p>Compare overall rankings, capability scores, and individual metrics.</p></a>
        <a href="/doc/get-started/"><h3>Get started <span>→</span></h3><p>Find documentation for data preparation, evaluation, and model integration.</p></a>
      </div>
    </section>
    <section className="public-section public-citation" aria-labelledby="citation-title"><h2 id="citation-title">Cite our work</h2><p>Citation details will be added when the public paper link is available.</p></section>
    <footer className="public-footer"><span>RoboValue</span><nav aria-label="Footer"><a href="/doc/">Document</a><a href="/leaderboard/">Leaderboard</a></nav></footer>
  </main>;
}
