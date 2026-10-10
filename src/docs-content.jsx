import React, { useEffect, useState } from 'react';
import { Figure } from './benchmark';
import { METRICS } from './benchmark-metrics';
import { INSTITUTIONS } from './project-info';

const OVERVIEW_METRICS = [
  ['Task-State Understanding', [
    ['sa', 'Do terminal values rank successful executions above unsuccessful ones?'],
    ['tga_ct', 'Does the correct instruction yield more value gain than other task instructions?'],
    ['tga_cf', 'Do edits to the required object, action, placement, or constraint reduce value gain?'],
    ['sia', 'Can the model identify the current subtask?'],
  ]],
  ['Temporal Progress Monitoring', [
    ['voc', 'Do values increase along a successful execution?'],
    ['cycle_voc', 'Do values rise in forward replay and fall in reverse replay?'],
    ['memory_voc', 'Do values track accumulated progress when similar visual states recur?'],
  ]],
  ['Failure and Recovery Reasoning', [
    ['fpl', 'Does the largest value decline align with failure onset?'],
    ['trr', 'Do value trends reflect failure, continued error, recovery attempts, and outcomes?'],
  ]],
  ['Value Consistency', [
    ['vs', 'Do values avoid both spurious fluctuations and prolonged flatness?'],
    ['csvc', 'Does the same subtask receive comparable gains across valid execution orders?'],
  ]],
];



export function EvaluationWorkflow() {
  return <div className="doc-content">
    <p className="doc-lead">Follow the path from model submission to organizer-run evaluation. Open-source models are integrated by the RoboValue team; closed-source models use a participant-provided service and adapter.</p>
    <Section id="workflow-path" title="Three steps to evaluation">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/adapters/">Submit a Model</a><p>Choose the open-source or closed-source route and describe your model, evaluation setting, and native predictions.</p></li>
        <li><a href="/doc/model-api/">Service &amp; Adapter</a><p>For closed-source models, provide the inference service and adapter. Open-source providers skip this handoff; the team handles integration.</p></li>
        <li><a href="/doc/get-started/evaluation/results/">Evaluation &amp; Results</a><p>The team evaluates the model on private trajectories and reports its supported coverage and diagnostic scores.</p></li>
      </ol>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/", 'Protocol & Metrics'], ["/doc/get-started/data/", 'Dataset Overview&Download']]} />
  </div>;
}

export function SubmitModel() {
  return <div className="doc-content">
    <p className="doc-lead">Start by telling the RoboValue team which model you want evaluated. This page covers the submission route and model information; service implementation belongs to the next step.</p>
    <Section id="submission-participation" title="Choose your submission route">
      <dl className="doc-definition-list"><div><dt>Open-source models</dt><dd>Share the model repository, checkpoint links, and inference instructions. The RoboValue team handles the adapter, inference setup, and evaluation. No participant-hosted service or adapter handoff is required.</dd></div><div><dt>Closed-source models</dt><dd>Provide an inference service and its model-specific adapter source. The RoboValue team reviews and runs the adapter; you do not need to release model weights. Follow <a href="/doc/model-api/">Service &amp; Adapter</a> for implementation and handoff details.</dd></div></dl>
    </Section>
    <Section id="submission-context" title="Describe your model">
      <ol className="doc-reading-path">
        <li><strong>Model version.</strong><p>Identify the model or checkpoint version and the preprocessing or prompt revision. Keep them fixed during evaluation.</p></li>
        <li><strong>Evaluation setting.</strong><p>Specify Zero-Shot, One-Shot, or Full-Shot. See <a href="/doc/get-started/protocol/evaluation/">Evaluation Protocol</a> for settings and domain coverage.</p></li>
        <li><strong>Native inputs and predictions.</strong><p>Describe the observations your model needs and the meaning, units, direction, and supported methods of its outputs.</p></li>
      </ol>
      <p>A model does not have to support all three prediction methods. Unsupported coverage is N/A, not zero. The <a href="/doc/model-api/#adapter-interfaces">adapter method table</a> defines scalar values, ordered comparisons, and subtask descriptions.</p>
    </Section>
    <Section id="submission-inputs" title="References and fine-tuning">
      <p>One-Shot uses the reference supplied on the evaluation side through the model adapter. For Full-Shot, download the training set and fine-tune your model before evaluation. The fine-tuned model uses the same inference interface as Zero-Shot; no training demonstrations are attached to each query.</p>
      <p>Find the download entry and reference-selection policy in <a href="/doc/get-started/data/#dataset-training">Dataset Overview&amp;Download</a>. Record the fine-tuned model version and training setup.</p>
    </Section>
    <Section id="submission-contact" title="Share your submission information">
      <p>See <a href="/community/">Community</a> to discuss the model and evaluation setting. Open-source submissions include the repository, checkpoints, dependencies, and inference instructions. Closed-source submissions continue to the service and adapter handoff. Share credentials privately.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Service & Adapter · closed-source models'], ["/doc/get-started/evaluation/results/", 'Evaluation & Results']]} />
  </div>;
}

export function EvaluationResults() {
  return <div className="doc-content">
    <p className="doc-lead">Once integration is complete, the RoboValue team runs the model on the held-out evaluation trajectories and reports the results. You do not need a local copy of the test set.</p>
    <PrivateTestNotice />
    <Section id="workflow-evaluate" title="Organizer-run evaluation">
      <p>The team uses the agreed model version, evaluation setting, and benchmark protocol. Evaluation preserves native output semantics and the observation context required by the model.</p>
      <p>Simulation and real-world coverage are reported separately, with ID, ENV-OOD, and EMB-OOD conditions identified. Metrics without supported or eligible coverage are N/A, not zero.</p>
    </Section>
    <Section id="workflow-results" title="Review the results">
      <p>Read the model version, setting, task/domain coverage, metric direction, and recorded protocol alongside each score. See <a href="/doc/get-started/protocol/evaluation/#protocol-results">how to read results</a> and the <a href="/doc/get-started/protocol/metrics/">metric definitions</a>.</p>
      <p>The <a href="/leaderboard/">Leaderboard</a> displays existing manuscript results under its own documented aggregate ranking rules. Completing an evaluation is not a promise of automatic publication or immediate inclusion on that page.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/", 'Protocol & Metrics'], ["/leaderboard/", 'Explore published results']]} />
  </div>;
}


export const documentationSections = {
  home: [['about-robovalue', 'About RoboValue'], ['benchmark-overview', 'Overview'], ['overview-metrics', 'Metrics'], ['explore-documentation', 'Explore']],
  start: [
    ['recommended-path', 'Recommended reading path'],
    ['evaluation-responsibilities', 'Who does what'],
    ['before-participating', 'Before participating'],
  ],
  data: [
    ['dataset-training', 'Training data download'],
    ['dataset-test', 'Evaluation trajectories'],
    ['dataset-settings', 'Evaluation tracks'],
    ['dataset-references', 'References and fine-tuning'],
    ['dataset-observations', 'Observations'],
    ['dataset-diagnostics', 'Diagnostic trajectory design'],
    ['dataset-access', 'Evaluation access'],
  ],
  evaluation: [
    ['workflow-path', 'Three steps to evaluation'],
  ],
  'evaluation-results': [
    ['workflow-evaluate', 'Organizer-run evaluation'],
    ['workflow-results', 'Review the results'],
  ],
  submission: [
    ['submission-participation', 'Open-source / closed-source'],
    ['submission-context', 'Describe your model'],
    ['submission-inputs', 'References and fine-tuning'],
    ['submission-contact', 'Share submission information'],
  ],
};

export function Section({ id, title, children }) {
  return <section className="doc-section" aria-labelledby={`${id}-title`}>
    <h2 id={id}><span id={`${id}-title`}>{title}</span><a className="doc-heading-anchor" href={`#${id}`} aria-label={`Link to ${title}`}>#</a></h2>
    {children}
  </section>;
}

function PrivateTestNotice() {
  return <aside className="doc-notice" aria-label="Private test-set evaluation">
    <strong>Private test set, organizer-run evaluation</strong>
    <p>RoboValue uses a private, held-out test set. The RoboValue team conducts the evaluation. The test set is not publicly released for download or local evaluation.</p>
  </aside>;
}

function TrainingDownloadLink() {
  return <button type="button" disabled title="Hugging Face download link to be added">Training data download · Hugging Face</button>;
}

export function NextSteps({ links }) {
  return <nav className="doc-next-steps" aria-label="Related documentation">
    <h2>Next steps</h2>
    <div className="doc-link-list">{links.map(([path, label]) => <a key={path} href={path}>{label}<span aria-hidden="true">→</span></a>)}</div>
  </nav>;
}

export function PageOutline({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.[0]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const reached = sections.filter(([id]) => document.getElementById(id)?.getBoundingClientRect().top <= 180);
      setActiveId((reached.at(-1) ?? sections[0])?.[0]);
      setProgress(Math.min(100, Math.round(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [sections]);
  return <aside className="page-outline" aria-label="Page sections">
    <nav aria-label="Page sections">{sections.map(([id, title]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? 'location' : undefined}>{title}</a>)}</nav>
    <div className="reading-progress" aria-label={`Reading progress: ${progress}%`}><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" /><circle className="reading-progress-value" cx="14" cy="14" r="11" pathLength="100" strokeDasharray={`${progress} 100`} /></svg><span>{progress}%</span></div>
  </aside>;
}

export function DocumentationOverview() {
  return <div className="doc-content doc-overview">
    <header className="doc-project-heading"><img src="/assets/robovalue-logo.png" alt="RoboValue" width="240" /><h1>RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1></header>
    <div className="doc-affiliations" aria-label="Participating institutions">{INSTITUTIONS.map(([name, file]) => <figure key={name}><img src={`/assets/affiliations/${file}`} alt="" loading="eager" /><figcaption>{name}</figcaption></figure>)}</div>
    <Section id="about-robovalue" title="What should a value model understand?">
      <p>A robot drops an object, reaches for it again, then continues without retrieving it. The retry is a recovery attempt; the unresolved error is its outcome. A useful value signal should distinguish the two. Recognizing success alone is not enough: a model may still miss a changed instruction, lose count of repeated actions, or assign different gains to the same subtask in different valid orders.</p>
      <p><strong>RoboValue is a fine-grained benchmark for understanding what robotic value models recognize—and what they miss.</strong> These models turn observations and instructions into feedback for data selection, policy improvement, and execution monitoring. RoboValue looks beyond final success to examine whether that feedback follows the task as it unfolds: what has been completed, what went wrong, and whether a correction actually worked.</p>
      <p>The benchmark examines four complementary capabilities: <strong>Task-State Understanding</strong>, <strong>Temporal Progress Monitoring</strong>, <strong>Failure and Recovery Reasoning</strong>, and <strong>Value Consistency</strong>. Together, they ask whether a model understands the instructed task and current subtask, tracks progress and regression, distinguishes recovery attempts from outcomes, and produces stable feedback with comparable subtask gains across valid solutions.</p>
      <p>The benchmark spans simulation and real-world manipulation. Successful executions establish progress ordering; diagnostic trajectories expose specific blind spots. Failure-and-recovery branches separate continued error from successful and unsuccessful corrections. Repeated actions revisit similar images at different stages of completion, making history relevant. Alternative valid subtask orders test whether the same work receives comparable gains. Instruction edits hold the execution fixed while changing what counts as success, and forward–reverse replay separates execution direction from elapsed time.</p>
      <p>Model-specific adapters expose scalar values, pairwise comparisons, and supported subtask descriptions while retaining each model’s native output semantics. Evaluation separates the standard setting from changes in embodiment and environment. The protocol distinguishes Zero-Shot, One-Shot, and Full-Shot tracks; the published results currently cover Zero-Shot and One-Shot. Training demonstrations support adaptation, while the held-out test trajectories remain private and are evaluated by the RoboValue team.</p>
    </Section>
    <Section id="benchmark-overview" title="Benchmark overview"><Figure src="/assets/overview-10-09.webp" alt="RoboValue overview: sim-and-real data, shared model interfaces, and four complementary evaluation capabilities" /></Section>
    <Section id="overview-metrics" title="What each metric asks">
      <div className="doc-table-scroll" tabIndex={0} role="region" aria-label="Evaluation metrics"><table className="doc-overview-metrics"><thead><tr><th scope="col">Capability</th><th scope="col">Metric</th><th scope="col">Key question</th></tr></thead><tbody>{OVERVIEW_METRICS.map(([capability, metrics]) => metrics.map(([key, question], index) => <tr key={key}>{index === 0 && <th scope="rowgroup" rowSpan={metrics.length}>{capability}</th>}<th scope="row"><a href={`/doc/get-started/protocol/metrics/${key.replaceAll('_', '-')}/`}>{key === 'sia' ? 'SIA' : METRICS[key].label}</a></th><td>{question}</td></tr>))}</tbody></table></div>
      <p className="doc-metric-note">Read these tests together. Cycle-VOC probes elapsed-time shortcuts in VOC and Memory-VOC; VS and CSVC assess consistency, not the correctness of progress direction.</p>
    </Section>
    <div id="explore-documentation"><NextSteps links={[["/doc/get-started/", 'Get started'], ["/doc/get-started/data/", 'Dataset Overview&Download'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/diagnostic-trajectories/", 'Diagnostic Trajectories']]} /></div>
  </div>;
}

export function GetStarted() {
  return <div className="doc-content">
    <p className="doc-lead">Understand the benchmark, choose the open-source or closed-source submission route, and have your model evaluated by the RoboValue team.</p>
    <PrivateTestNotice />
    <Section id="recommended-path" title="Recommended reading path">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/data/">Dataset Overview&amp;Download</a><p>Find the <a href="/doc/get-started/data/#dataset-training">Training data download</a> entry and understand training and evaluation trajectories.</p></li>
        <li><a href="/doc/get-started/protocol/">Protocol &amp; Metrics</a><p>Choose the relevant evaluation setting and learn what each capability score does—and does not—establish.</p></li>
        <li><a href="/doc/get-started/evaluation/">Evaluation Workflow</a><p>Follow the submission route, service integration where needed, and evaluation reporting in three steps.</p></li>
      </ol>
    </Section>
    <Section id="evaluation-responsibilities" title="Who does what">
      <p>Participants share an open-source model or provide a closed-source inference service and adapter. The RoboValue team handles integration review, One-Shot references, private test queries, scoring, and results. See <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for the steps.</p>
    </Section>
    <Section id="before-participating" title="Before participating">
      <p>Choose the evaluation setting, identify the inputs and predictions your model supports, and document its native output semantics. Keep Zero-Shot, One-Shot, and Full-Shot results distinct.</p>
      <p>Read the <a href="/doc/get-started/data/#dataset-references">reference and fine-tuning policy</a> before preparing your model.</p>
      <p>See <a href="/community/">Community</a> for participation and integration discussions. Do not post API keys or other credentials publicly.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/adapters/", 'Submit a Model'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/simulation-tasks/", 'Simulation Tasks'], ["/doc/real-world-tasks/", 'Real-World Tasks']]} />
  </div>;
}

export function DatasetOverview() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue separates training demonstrations for model preparation from private test trajectories for evaluation, across both simulation and real-world tasks.</p>
    <Section id="dataset-training" title="Training data download">
      <p>Each task has 100 expert training demonstrations, collected under standard in-domain conditions and separate from the test trajectories.</p>
      <p>Training data does not include subtask boundary annotations. Annotations constructed for a model’s adaptation are separate from the benchmark’s test-set labels.</p>
      <div className="doc-download-panel"><div><strong>Training data on Hugging Face</strong><p>The download link will be added here when available.</p></div><TrainingDownloadLink /></div>
    </Section>
    <Section id="dataset-test" title="Evaluation Trajectories">
      <p>Test trajectories cover standard conditions and separate environment and embodiment shifts. Annotations support subtask identification, failure localization, recovery-stage reasoning, and cross-solution comparisons.</p>
      <PrivateTestNotice />
      <p>Public task pages illustrate task specifications and representative executions. They are not a download interface for the held-out trajectories or evaluation labels.</p>
    </Section>
    <Section id="dataset-settings" title="Evaluation tracks and demonstration access">
      <div className="doc-track-grid">
        <div><span className="doc-pill">No task-specific demonstrations</span><h3>Zero-Shot</h3><p>Evaluate without task-specific adaptation or training references.</p></div>
        <div><span className="doc-pill">One reference demonstration</span><h3>One-Shot</h3><p>Use the first training trajectory through the adapter on the evaluation side.</p></div>
        <div><span className="doc-pill">Full training split</span><h3>Full-Shot</h3><p>Fine-tune the model on all 100 training trajectories per task before evaluation.</p></div>
      </div>
      <p>Environment and embodiment shifts are evaluated separately, without additional adaptation to the shifted conditions. State the evaluation setting independently of the adapter’s supported prediction methods.</p>
    </Section>
    <Section id="dataset-references" title="One-Shot references and Full-Shot fine-tuning">
      <p><strong>One-Shot:</strong> the first training trajectory for each task is available to the adapter on the evaluation side. The adapter reads it and prepares the reference inputs your model needs.</p>
      <p><strong>Full-Shot:</strong> use the full training split for each task—all 100 trajectories—to fine-tune your model using your own training procedure. Provide the resulting model through the same inference interface as Zero-Shot; no per-query training reference is required.</p>
      <p>The same policy applies to simulation and real-world tasks. Use only the training split for fine-tuning, never the private test trajectories. See <a href="/doc/model-api/#adapter-example">RoboMeter and Robo-Dopamine</a> for concrete adapter implementations.</p>
    </Section>
    <Section id="dataset-observations" title="Dataset observations and model inputs">
      <p>Trajectories contain synchronized RGB-D observations from a head-mounted camera and two wrist-mounted cameras, together with robot states and action targets. This describes the dataset, not a mandatory service payload.</p>
      <p>Document the observations your model needs and agree on their availability with the team. The model-specific adapter owns view selection, history, frame sampling, and preprocessing. Do not assume every recorded modality is provided to a service or that every model receives the same frame sequence.</p>
    </Section>
    <Section id="dataset-diagnostics" title="Executions designed to reveal specific gaps">
      <dl className="doc-definition-list"><div><dt>Expert demonstrations</dt><dd>Successful executions support progress ordering and instruction-grounding tests.</dd></div><div><dt>Failure and recovery</dt><dd>Continued error, effective recovery, and ineffective recovery separate failure recognition, corrective attempts, and outcomes.</dd></div><div><dt>Long-horizon temporal trajectories</dt><dd>Repeated actions and visually similar states test whether judgments depend on execution history.</dd></div><div><dt>Multi-solution trajectories</dt><dd>Alternative valid subtask orders test whether semantic progress remains consistent across solutions.</dd></div></dl>
    </Section>
    <Section id="dataset-access" title="From training access to test evaluation">
      <p>Training-data access does not grant access to the held-out test split. Both open-source and closed-source models are evaluated by the RoboValue team. See <a href="/doc/get-started/adapters/">Submit a Model</a> for the two submission routes, or <a href="/community/">Community</a> to discuss participation.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Service & Adapter'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/protocol/", 'Protocol & Metrics']]} />
  </div>;
}
