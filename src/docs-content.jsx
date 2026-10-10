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
    <Section id="workflow-path" title="Steps">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/adapters/">Submission</a><p>Choose the open-source or closed-source route and describe your model, evaluation setting, and native predictions.</p></li>
        <li><a href="/doc/model-api/">Service &amp; Adapter</a><p>For closed-source models, provide the inference service and adapter. Open-source providers skip this handoff; the team handles integration.</p></li>
        <li><a href="/doc/get-started/evaluation/results/">Evaluation &amp; Results</a><p>The team evaluates the model on private trajectories and reports its supported coverage and diagnostic scores.</p></li>
      </ol>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/", 'Protocol'], ["/doc/get-started/data/", 'Dataset Overview']]} />
  </div>;
}

export function SubmitModel() {
  return <div className="doc-content">
    <p className="doc-lead">Start by telling the RoboValue team which model you want evaluated. This page covers the submission route and model information; service implementation belongs to the next step.</p>
    <Section id="submission-participation" title="Participation">
      <dl className="doc-definition-list"><div><dt>Open-Source Models</dt><dd>Share the model repository, checkpoint links, and inference instructions. The RoboValue team handles the adapter, inference setup, and evaluation. No participant-hosted service or adapter handoff is required.</dd></div><div><dt>Closed-Source Models</dt><dd>Provide an inference service and its model-specific adapter source. The RoboValue team reviews and runs the adapter; you do not need to release model weights. Follow <a href="/doc/model-api/">Service &amp; Adapter</a> for implementation and handoff details.</dd></div></dl>
    </Section>
    <Section id="submission-context" title="Model Details">
      <ol className="doc-reading-path">
        <li><strong>Model version.</strong><p>Identify the model or checkpoint version and the preprocessing or prompt revision. Keep them fixed during evaluation.</p></li>
        <li><strong>Evaluation setting.</strong><p>Specify Zero-Shot, One-Shot, or Full-Shot. See <a href="/doc/get-started/protocol/evaluation/">Evaluation Protocol</a> for settings and domain coverage.</p></li>
        <li><strong>Native inputs and predictions.</strong><p>Describe the observations your model needs and the meaning, units, direction, and supported methods of its outputs.</p></li>
      </ol>
      <p>A model does not have to support all three prediction methods. Unsupported coverage is N/A, not zero. The <a href="/doc/model-api/#adapter-interfaces">adapter method table</a> defines scalar values, ordered comparisons, and subtask descriptions.</p>
    </Section>
    <Section id="submission-inputs" title="Adaptation">
      <p>One-Shot uses the reference supplied on the evaluation side through the model adapter. For Full-Shot, download the training set and fine-tune your model before evaluation. The fine-tuned model uses the same inference interface as Zero-Shot; no training demonstrations are attached to each query.</p>
      <p>Find training data in <a href="/doc/get-started/data/download/">Download</a> and reference-selection rules in <a href="/doc/get-started/protocol/evaluation/#dataset-references">Evaluation Protocol</a>. Record the fine-tuned model version and training setup.</p>
    </Section>
    <Section id="submission-contact" title="Submission">
      <p>See <a href="/community/">Community</a> to discuss the model and evaluation setting. Open-source submissions include the repository, checkpoints, dependencies, and inference instructions. Closed-source submissions continue to the service and adapter handoff. Share credentials privately.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Service & Adapter · Closed-Source Models'], ["/doc/get-started/evaluation/results/", 'Results']]} />
  </div>;
}

export function EvaluationResults() {
  return <div className="doc-content">
    <p className="doc-lead">Once integration is complete, the RoboValue team runs the model on the held-out evaluation trajectories and reports the results. You do not need a local copy of the test set.</p>
    <PrivateTestNotice />
    <Section id="workflow-evaluate" title="Organizer-Run Evaluation">
      <p>The team uses the agreed model version, evaluation setting, and benchmark protocol. Evaluation preserves native output semantics and the observation context required by the model.</p>
      <p>Simulation and real-world coverage are reported separately, with ID, ENV-OOD, and EMB-OOD conditions identified. Metrics without supported or eligible coverage are N/A, not zero.</p>
    </Section>
    <Section id="workflow-results" title="Results">
      <p>Read the model version, setting, task/domain coverage, metric direction, and recorded protocol alongside each score. See <a href="/doc/get-started/protocol/evaluation/#protocol-results">how to read results</a> and the <a href="/doc/get-started/protocol/metrics/">metric definitions</a>.</p>
      <p>The <a href="/leaderboard/">Leaderboard</a> displays existing manuscript results under its own documented aggregate ranking rules. Completing an evaluation is not a promise of automatic publication or immediate inclusion on that page.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/", 'Protocol'], ["/leaderboard/", 'Published Results']]} />
  </div>;
}


export const documentationSections = {
  home: [['about-robovalue', 'Get Known about RoboValue'], ['benchmark-overview', 'Overview'], ['overview-metrics', 'Metrics'], ['explore-documentation', 'Explore']],
  start: [
    ['recommended-path', 'Reading Guide'],
    ['evaluation-responsibilities', 'Responsibilities'],
    ['before-participating', 'Before Participating'],
  ],
  data: [
    ['dataset-splits', 'Training Data'],
    ['dataset-test', 'Evaluation Trajectories'],
    ['dataset-settings', 'Tracks'],
    ['dataset-observations', 'Observations'],
    ['dataset-diagnostics', 'Diagnostics'],
    ['dataset-access', 'Evaluation Access'],
  ],
  'data-download': [['dataset-training', 'Training Data']],
  evaluation: [
    ['workflow-path', 'Steps'],
  ],
  'evaluation-results': [
    ['workflow-evaluate', 'Organizer-Run Evaluation'],
    ['workflow-results', 'Results'],
  ],
  submission: [
    ['submission-participation', 'Participation'],
    ['submission-context', 'Model Details'],
    ['submission-inputs', 'Adaptation'],
    ['submission-contact', 'Submission'],
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
    <strong>Private Test Set, Organizer-Run Evaluation</strong>
    <p>RoboValue uses a private, held-out test set. The RoboValue team conducts the evaluation. The test set is not publicly released for download or local evaluation.</p>
  </aside>;
}

function TrainingDownloadLink() {
  return <button type="button" disabled title="Hugging Face download link to be added">Training data download · Hugging Face</button>;
}

export function NextSteps({ links }) {
  return <nav className="doc-next-steps" aria-label="Related documentation">
    <h2>Next Steps</h2>
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
    <Section id="about-robovalue" title="Get Known about RoboValue">
      <p>General-purpose robotic value models assess task execution from visual observations and task instructions, providing feedback for policy learning, planning, and execution monitoring. Their errors can influence which behaviors are selected, reinforced, or corrected. However, strong outcome discrimination or forward-progress correlation can still conceal errors in intermediate value judgments, while differences in model interfaces and value semantics hinder consistent diagnosis across models.</p>
      <p><strong>RoboValue is a fine-grained sim-and-real benchmark for unified evaluation of robotic value models.</strong> Its central principle is that value feedback should accurately reflect how well task requirements are being fulfilled throughout execution. RoboValue evaluates four complementary capability dimensions: <strong>Task-State Understanding</strong>, <strong>Temporal Progress Monitoring</strong>, <strong>Failure and Recovery Reasoning</strong>, and <strong>Value Consistency</strong>.</p>
      <p><strong>RoboValue-Dataset</strong> combines expert training demonstrations with annotated test trajectories from simulation and real-world manipulation. Diagnostic trajectories and instruction variations probe task grounding, history-dependent progress, recovery outcomes, and consistent subtask credit across valid solutions. These contrasts expose limitations that final outcomes and forward-progress scores alone can overlook.</p>
      <p><strong>RoboValue-Benchmark</strong> uses shared interfaces and model-specific adapters to compare heterogeneous models while preserving their native value semantics. Evaluation separates standard conditions from shifts in robot embodiment and environment. <strong>RoboValue-Leaderboard</strong> presents overall rankings and capability profiles, supporting continued assessment of the reliability of value feedback.</p>
    </Section>
    <Section id="benchmark-overview" title="Benchmark Overview"><Figure src="/assets/overview-10-09.webp" alt="RoboValue overview: sim-and-real data, shared model interfaces, and four complementary evaluation capabilities" /></Section>
    <Section id="overview-metrics" title="Metrics">
      <div className="doc-table-scroll" tabIndex={0} role="region" aria-label="Evaluation metrics"><table className="doc-overview-metrics"><thead><tr><th scope="col">Capability</th><th scope="col">Metric</th><th scope="col">Evaluation Focus</th></tr></thead><tbody>{OVERVIEW_METRICS.map(([capability, metrics]) => metrics.map(([key, question], index) => <tr key={key}>{index === 0 && <th scope="rowgroup" rowSpan={metrics.length}>{capability}</th>}<th scope="row"><a href={`/doc/get-started/protocol/metrics/${key.replaceAll('_', '-')}/`}>{key === 'sia' ? 'SIA' : METRICS[key].label}</a></th><td>{question}</td></tr>))}</tbody></table></div>
      <p className="doc-metric-note">Read these tests together. Cycle-VOC probes elapsed-time shortcuts in VOC and Memory-VOC; VS and CSVC assess consistency, not the correctness of progress direction.</p>
    </Section>
    <div id="explore-documentation"><NextSteps links={[["/doc/get-started/", 'Usage'], ["/doc/get-started/data/", 'Dataset Overview'], ["/doc/get-started/data/download/", 'Download'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/diagnostic-trajectories/", 'Diagnostic Trajectories']]} /></div>
  </div>;
}

export function GetStarted() {
  return <div className="doc-content">
    <p className="doc-lead">This quick start helps you get started with RoboValue evaluation.</p>
    <PrivateTestNotice />
    <Section id="recommended-path" title="Reading Guide">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/data/">Dataset</a><p>Explore the training and evaluation trajectories, and find the <a href="/doc/get-started/data/download/#dataset-training">training data download</a>.</p></li>
        <li><a href="/doc/get-started/evaluation/">Evaluation Workflow</a><p>Learn what to provide, how your model is integrated, and how you receive evaluation results.</p></li>
        <li><a href="/doc/get-started/protocol/">Protocol</a><p>Review the evaluation tracks and metrics before preparing your submission.</p></li>
      </ol>
    </Section>
    <Section id="evaluation-responsibilities" title="Responsibilities">
      <p>Participants share an open-source model or provide a closed-source inference service and adapter. The RoboValue team handles integration review, One-Shot references, private test queries, scoring, and results. See <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for the steps.</p>
    </Section>
    <Section id="before-participating" title="Before Participating">
      <p>Choose the evaluation setting, identify the inputs and predictions your model supports, and document its native output semantics. Keep Zero-Shot, One-Shot, and Full-Shot results distinct.</p>
      <p>Read the <a href="/doc/get-started/protocol/evaluation/#dataset-references">reference and fine-tuning policy</a> before preparing your model.</p>
      <p>See <a href="/community/">Community</a> for participation and integration discussions. Do not post API keys or other credentials publicly.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/adapters/", 'Submission'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/simulation-tasks/", 'Simulation Tasks'], ["/doc/real-world-tasks/", 'Real-World Tasks']]} />
  </div>;
}

export function DatasetOverview() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue separates training demonstrations for model preparation from private test trajectories for evaluation, across both simulation and real-world tasks.</p>
    <Section id="dataset-splits" title="Training Data">
      <p>Expert demonstrations are collected under standard conditions, separately from the private evaluation trajectories. Use them for model preparation under the agreed evaluation track.</p>
      <p>See <a href="/doc/get-started/data/download/">Download</a> for training-data access and <a href="/doc/get-started/protocol/evaluation/#dataset-references">Evaluation Protocol</a> for adaptation rules.</p>
    </Section>
    <Section id="dataset-test" title="Evaluation Trajectories">
      <p>Test trajectories cover standard conditions and separate environment and embodiment shifts. Annotations support subtask identification, failure localization, recovery-stage reasoning, and cross-solution comparisons.</p>
      <PrivateTestNotice />
      <p>Public task pages illustrate task specifications and representative executions. They are not a download interface for the held-out trajectories or evaluation labels.</p>
    </Section>
    <Section id="dataset-settings" title="Tracks">
      <div className="doc-track-grid">
        <div><span className="doc-pill">No task-specific demonstrations</span><h3>Zero-Shot</h3><p>Evaluate without task-specific adaptation or training references.</p></div>
        <div><span className="doc-pill">One reference demonstration</span><h3>One-Shot</h3><p>Use the first training trajectory through the adapter on the evaluation side.</p></div>
        <div><span className="doc-pill">Full training split</span><h3>Full-Shot</h3><p>Fine-tune the model on all 100 training trajectories per task before evaluation.</p></div>
      </div>
      <p>Environment and embodiment shifts are evaluated separately, without additional adaptation to the shifted conditions. State the evaluation setting independently of the adapter’s supported prediction methods.</p>
    </Section>

    <Section id="dataset-observations" title="Observations">
      <p>Trajectories contain synchronized RGB-D observations from a head-mounted camera and two wrist-mounted cameras, together with robot states and action targets. This describes the dataset, not a mandatory service payload.</p>
      <p>Document the observations your model needs and agree on their availability with the team. The model-specific adapter owns view selection, history, frame sampling, and preprocessing. Do not assume every recorded modality is provided to a service or that every model receives the same frame sequence.</p>
    </Section>
    <Section id="dataset-diagnostics" title="Diagnostics">
      <dl className="doc-definition-list"><div><dt>Expert Demonstrations</dt><dd>Successful executions support progress ordering and instruction-grounding tests.</dd></div><div><dt>Failure–Recovery</dt><dd>Continued error, effective recovery, and ineffective recovery separate failure recognition, corrective attempts, and outcomes.</dd></div><div><dt>Long-Horizon</dt><dd>Repeated actions and visually similar states test whether judgments depend on execution history.</dd></div><div><dt>Multi-Solution Trajectories</dt><dd>Alternative valid subtask orders test whether semantic progress remains consistent across solutions.</dd></div></dl>
    </Section>
    <Section id="dataset-access" title="Evaluation Access">
      <p>Training-data access does not grant access to the held-out test split. Both open-source and closed-source models are evaluated by the RoboValue team. See <a href="/doc/get-started/adapters/">Submission</a> for the two submission routes, or <a href="/community/">Community</a> to discuss participation.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Integration'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/protocol/", 'Protocol']]} />
  </div>;
}

export function DatasetDownload() {
  return <div className="doc-content">
    <p className="doc-lead">Access the training demonstrations used for model preparation. This download entry covers training data only; evaluation trajectories remain private.</p>
    <Section id="dataset-training" title="Training Data">
      <p>Each task has 100 expert training demonstrations, collected under standard in-domain conditions and separate from the test trajectories.</p>
      <p>Training data does not include subtask boundary annotations. Annotations constructed for a model’s adaptation are separate from the benchmark’s test-set labels.</p>
      <div className="doc-download-panel"><div><strong>Training data on Hugging Face</strong><p>The download link will be added here when available.</p></div><TrainingDownloadLink /></div>
    </Section>

    <NextSteps links={[["/doc/get-started/data/", 'Dataset Overview'], ["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol']]} />
  </div>;
}
