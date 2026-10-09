import React from 'react';
import { Figure } from './benchmark';
import { GROUPS, METRICS } from './benchmark-metrics';
import { metricDocumentation } from './docs-metrics';

export function EvaluationWorkflow() {
  return <div className="doc-content">
    <p className="doc-lead">Follow the participation workflow from a model API to an organizer-run diagnostic evaluation. You do not need to install a local evaluator or obtain the private test set.</p>
    <PrivateTestNotice />
    <Section id="workflow-discuss" title="1. Discuss your model">
      <p>Use <a href="/community/">Community</a> to discuss participation with the RoboValue team. Identify the model and checkpoint/version, whether you are seeking Zero-Shot, One-Shot, or Few-Shot evaluation, and the native observation context and outputs the model supports.</p>
      <p>Read <a href="/doc/get-started/adapters/">Submit a Model</a> for the benchmark-level capabilities relevant to integration.</p>
    </Section>
    <Section id="workflow-connect" title="2. Coordinate API integration">
      <p>Participants provide a model-side inference service. Agree on the model and preprocessing versions, supported operations, RGB views, history sampling, reference demonstrations, and native output semantics before the private-test run.</p>
      <p>Use the <a href="/doc/get-started/adapters/#submission-api">API contract</a>: HTTP JSON requests and numeric or textual predictions, not benchmark scores. The model service chooses its endpoint path; there is no public evaluation or submission endpoint. The team checks integration with synthetic inputs before using held-out observations.</p>
      <p>Use HTTPS and share credentials privately, not in public documentation or Community messages. An externally hosted API receives the observations needed for inference. If observations must not leave the organizer environment, the model service must be hosted within that environment. Confirm data-handling arrangements and the evaluation package version during integration.</p>
    </Section>
    <Section id="workflow-evaluate" title="3. Organizer-run evaluation">
      <p>The RoboValue team conducts evaluation on held-out test trajectories under the agreed setting and applicable benchmark protocol. When the setting permits training references, the model provider prepares the designated training demonstrations before evaluation. Inference requests do not carry reference demonstrations.</p>
      <p>Evaluation preserves each model’s native value semantics and required observation context. Simulation and real-world coverage, as well as ID, ENV-OOD, and EMB-OOD conditions, remain distinguishable. Metrics without supported or eligible coverage are N/A, not observed zeros.</p>
      <p>The organizers’ internal query planning, inference, scoring, and result handling are not participant installation steps. Refer to <a href="/doc/get-started/protocol/">Protocol &amp; Metrics</a> for the scientific contracts.</p>
    </Section>
    <Section id="workflow-results" title="4. Read the results">
      <p>Read the setting, task/domain coverage, metric direction, and protocol context before comparing scores. Diagnostic metrics expose different strengths and limitations; a strong success score does not establish reliable failure or recovery reasoning.</p>
      <p>The <a href="/leaderboard/">Leaderboard</a> displays existing manuscript results. Its published aggregate ranking follows its own documented rules; completing an evaluation is not a promise of automatic publication or immediate inclusion on that page.</p>
    </Section>
    <Section id="workflow-questions" title="Common questions">
      <dl className="doc-definition-list"><div><dt>Can I download the test set and run it locally?</dt><dd>No. The held-out test set is private; participants provide a model API for evaluation by the RoboValue team.</dd></div><div><dt>Must my model support every interface?</dt><dd>Describe the native capabilities it actually supports. Applicable metric coverage depends on those capabilities and the benchmark protocol; unsupported coverage must not be presented as a measured score.</dd></div><div><dt>Does One-Shot / Few-Shot mean full-data training?</dt><dd>No. One-Shot uses one standard-scenario training demonstration per task; Few-Shot uses a limited number agreed with the organizers. The separate Full-Data Track remains planned.</dd></div><div><dt>Where can I ask integration questions?</dt><dd>Use the existing <a href="/community/">Community</a> channel to contact the team. Keep credentials out of public discussions.</dd></div></dl>
    </Section>
    <NextSteps links={[["/doc/get-started/adapters/", 'Submit a Model'], ["/doc/get-started/protocol/", 'Protocol & Metrics'], ["/leaderboard/", 'Explore published results']]} />
  </div>;
}

export function SubmitModel() {
  return <div className="doc-content">
    <p className="doc-lead">Prepare a model service and agree on its evaluation setting with the RoboValue team. You provide predictions; the organizers handle the private test set and scoring.</p>
    <Section id="submission-participation" title="Start with the team">
      <p>Use <a href="/community/">Community</a> to discuss participation. There is no deployed submission platform or promised evaluation slot. Share connection details and credentials privately.</p>
    </Section>
    <Section id="submission-context" title="Describe the model you want evaluated">
      <ol className="doc-reading-path">
        <li><strong>Freeze the identity.</strong><p>Specify the model/checkpoint version and preprocessing or prompt revision.</p></li>
        <li><strong>Agree on the setting.</strong><p>Choose Zero-Shot or a One-Shot / Few-Shot setting. Confirm the demonstration count, selected training assets, and permitted model-side preparation. Full-Data remains planned.</p></li>
        <li><strong>Explain the inputs.</strong><p>Describe required RGB views, execution history, and sampling. The current API does not transport depth, states, actions, or streaming sessions.</p></li>
        <li><strong>State native output semantics.</strong><p>Explain the meaning, units, direction, and supported operations of the model’s predictions.</p></li>
      </ol>
    </Section>
    <Section id="submission-capabilities" title="Declare only the operations you support">
      <p>A model does not have to implement all three operations. Scalar value, ordered comparison, and subtask text support different metric coverage. Unsupported coverage is N/A, not zero.</p>
      <p>The <a href="/doc/model-api/#api-operations">operation table</a> explains the inputs, outputs, and applicable metric interfaces.</p>
    </Section>
    <Section id="submission-api" title="Implement the model API">
      <p>Use the implemented <code>robovalue-inference-v2</code> contract. Endpoint paths are configurable; model identity is separate from the remote backend. Follow <a href="/doc/model-api/">Model API</a> for the wire format, organizer configuration, and CPU mock.</p>
    </Section>
    <Section id="submission-inputs" title="Prepare permitted training references beforehand">
      <p>Training references remain on the model-service side and are not attached to inference requests. Confirm eligible assets and the allowed demonstration count, then freeze selection and preprocessing. See <a href="/doc/get-started/data/#dataset-references">training references</a> and <a href="/doc/model-api/#api-inputs">input and history requirements</a>.</p>
    </Section>
    <Section id="submission-semantics" title="Keep the prediction target intact">
      <p>Do not impose a common min–max normalization or silently change the model’s prediction target. Agree on native comparison or explicit <code>V(b) − V(a)</code>; neither is an automatic fallback for the other. SIA services return subtask text, not benchmark scores.</p>
    </Section>
    <Section id="submission-contact" title="Coordinate evaluation">
      <p>The test set is private. The organizers prepare queries, compute metrics, and report results under the agreed protocol. Follow <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for the responsibilities and reporting steps.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Model API'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/community/", 'Community']]} />
  </div>;
}

export function ProtocolGuide() {
  return <div className="doc-content">
    <p className="doc-lead">Understand the evaluation settings, metric contracts, and limits of a capability profile. Model-specific adapters preserve native value semantics across scalar, pairwise, and textual interfaces.</p>
    <Section id="protocol-settings" title="Evaluation settings">
      <dl className="doc-definition-list"><div><dt>Zero-shot</dt><dd>Released checkpoints without task-specific adaptation or reference demonstrations.</dd></div><div><dt>One-Shot / Few-Shot</dt><dd>Use designated standard-scenario training demonstrations, separate from held-out test trajectories, for conditioning or task-specific adaptation. One-Shot uses one demonstration per task; Few-Shot uses a limited number agreed with the organizers. Record the exact count and selection.</dd></div><div><dt>Generalization</dt><dd>Change the embodiment or environment without further adaptation to the shifted condition.</dd></div><div><dt>Full-Data Track</dt><dd>A separate planned track for training or fine-tuning on all 3,500 demonstrations. It is not a currently available evaluation ranking.</dd></div></dl>
      <Figure src="/assets/benchmark-overview.svg" alt="RoboValue shared model interfaces and four diagnostic capability dimensions" caption="Four complementary dimensions diagnose execution understanding while preserving model-specific value semantics." />
    </Section>
    <Section id="protocol-coverage" title="Domains and coverage">
      <p><strong>ID</strong> is the standard in-domain condition; <strong>ENV-OOD</strong> changes the environment; <strong>EMB-OOD</strong> changes the embodiment. Simulation and real-world results are separate coverage axes, not interchangeable observations.</p>
      <p>Use each metric’s eligible trajectories, exclusions, and task/domain aggregation order. Missing or unsupported coverage is <strong>N/A</strong>, not zero. The published tables report TRR and CSVC only in ID; do not manufacture shifted-condition cells.</p>
      <p>Metric contracts do not impose one universal macro-average or a common min–max normalization on native model outputs. The manuscript leaderboard’s separate aggregate scoring policy is described below.</p>
    </Section>
    {GROUPS.map(group => <Section key={group.id} id={`protocol-${group.id}`} title={group.title}>
      <p>{group.description}</p>
      {group.metrics.map(key => {
        const metric = METRICS[key];
        const contract = metricDocumentation[key];
        return <article className="doc-metric-contract" key={key} aria-labelledby={`metric-${key}-title`}>
          <h3 id={`metric-${key}`}><span id={`metric-${key}-title`}>{metric.label} {metric.lower ? '↓' : '↑'} · {metric.name}</span><a className="doc-heading-anchor" href={`#metric-${key}`} aria-label={`Link to ${metric.label}`}>#</a></h3>
          <p className="doc-metric-aliases">{contract.aliases}</p>
          <p className="doc-metric-purpose">{contract.purpose}</p>
          <dl className="doc-contract-rules"><div><dt>Coverage</dt><dd>{contract.cohort}</dd></div><div><dt>Scoring contract</dt><dd>{contract.rules}</dd></div><div><dt>Interpretation</dt><dd>{contract.interpretation}</dd></div></dl>
        </article>;
      })}
    </Section>)}
    <Section id="metric-sia" title="Subtask Identification Accuracy (SIA) ↑">
      <p>SIA evaluates whether a generated description matches the annotated active subtask. A textual description is an intermediate model response, not a completed score.</p>
      <p>The judging stage uses forced-choice candidate probabilities and retains the probability assigned to the ground-truth subtask. Aggregate those probabilities geometrically within each task, then follow the recorded task/domain protocol. Do not replace this with an arithmetic mean of query probabilities, hard-label accuracy, or one global geometric mean across all tasks.</p>
      <p>SIA is reported separately and contributes no weight to the current aggregate leaderboard. Read its coverage and setting alongside the reported probability score. Implementation key: <code>sia</code>; paper naming aliases do not change the contract.</p>
    </Section>
    <Section id="protocol-results" title="Read the leaderboard">
      <ol className="doc-reading-path"><li><strong>Select the evaluation track.</strong><p>Keep Zero-Shot, One-Shot, and Few-Shot results distinct, including the demonstration count. The existing published snapshot has separate Zero-Shot and One-Shot rankings; these are not Few-Shot results.</p></li><li><strong>Select the condition and check coverage.</strong><p>Separate standard, embodiment-shift, and environment-shift results. An unreported cell is not a measured zero.</p></li><li><strong>Read the metric direction and units.</strong><p>The current website tables display scores ×100. FPL is lower-is-better; the other displayed primary metrics are higher-is-better.</p></li><li><strong>Compare capability profiles before overall ranks.</strong><p>Success, grounding, progress, failure/recovery, and consistency diagnose different behaviors. Inspect limitations even when an overall score is high.</p></li></ol>
      <p>The <a href="/leaderboard/#scoring">published aggregate scoring guide</a> documents that snapshot’s normalization, condition/domain weights, capability weights, and missing-metric policy. Its treatment of unmeasured metrics in the aggregate rank does not turn missing scientific coverage into observed zeros.</p>
      <p>VROC, the reverse-half progress correlation, contributes to the published aggregate tracking score but is not separately tabulated in Tables 2–3. Do not infer it from rounded table entries. SIA remains outside the aggregate ranking.</p>
    </Section>
    <Section id="protocol-provenance" title="Metric contracts and published result snapshots">
      <aside className="doc-notice" aria-label="Protocol and result provenance"><strong>Definitions are not a reproduction claim</strong><p>This guide records the current author-confirmed contracts, including the October 6, 2026 VOC/VS query alignment and CSVC scoring alignment. The existing website results retain the October 7, 2026 manuscript snapshot; no scores are recomputed by this documentation update.</p></aside>
      <p>The current VOC query cohort is the Cycle-VOC forward cohort, not the legacy standalone cohort. CSVC uses its versioned symmetric-ratio contract rather than legacy RMSE scoring. VS preserves the vs_v1 formula while recording its shared forward-query input protocol. Historical TRR sampling selections may differ between simulation and real-world preparation.</p>
      <p>Changing a query plan or scoring contract requires versioned results and compatible caches. Describing aligned formulas or passing unit tests does not establish archived all-model reproduction. An archived result must be interpreted with its recorded protocol and frozen selection, not silently relabeled or overwritten.</p>
    </Section>
    <NextSteps links={[["/leaderboard/", 'Leaderboard'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/simulation-tasks/", 'Simulation Tasks'], ["/doc/real-world-tasks/", 'Real-World Tasks']]} />
  </div>;
}

export const documentationSections = {
  home: [
    ['about-robovalue', 'About RoboValue'],
    ['private-test-evaluation', 'Private-test evaluation'],
    ['explore-documentation', 'Explore the documentation'],
    ['citation', 'Citation'],
  ],
  start: [
    ['recommended-path', 'Recommended reading path'],
    ['evaluation-responsibilities', 'Who does what'],
    ['before-participating', 'Before participating'],
  ],
  data: [
    ['dataset-training', 'Training split'],
    ['dataset-test', 'Private test split'],
    ['dataset-settings', 'Evaluation tracks'],
    ['dataset-references', 'Training references'],
    ['dataset-observations', 'Observations'],
    ['dataset-diagnostics', 'Diagnostic trajectory design'],
    ['dataset-access', 'Evaluation access'],
  ],
  evaluation: [
    ['workflow-discuss', 'Discuss your model'],
    ['workflow-connect', 'Coordinate API integration'],
    ['workflow-evaluate', 'Organizer-run evaluation'],
    ['workflow-results', 'Read the results'],
    ['workflow-questions', 'Common questions'],
  ],
  submission: [
    ['submission-participation', 'Participation'],
    ['submission-context', 'Describe your model'],
    ['submission-capabilities', 'Native model capabilities'],
    ['submission-api', 'API contract (v2)'],
    ['submission-inputs', 'Input and history agreement'],
    ['submission-semantics', 'Preserve value semantics'],
    ['submission-contact', 'Discuss integration'],
  ],
  protocol: [
    ['protocol-settings', 'Evaluation settings'],
    ['protocol-coverage', 'Domains and coverage'],
    ...GROUPS.map(group => [`protocol-${group.id}`, group.title]),
    ['metric-sia', 'Subtask identification'],
    ['protocol-results', 'Read the leaderboard'],
    ['protocol-provenance', 'Contracts and result snapshots'],
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
    <p>RoboValue uses a private, held-out test set. Participants provide a model API, and the RoboValue team conducts the evaluation. The test set is not publicly released for download or local evaluation.</p>
  </aside>;
}

function TrainingDownloadLink() {
  return <button type="button" disabled title="Hugging Face download link to be added">Training data · Hugging Face</button>;
}

export function NextSteps({ links }) {
  return <nav className="doc-next-steps" aria-label="Related documentation">
    <h2>Next steps</h2>
    <div className="doc-link-list">{links.map(([path, label]) => <a key={path} href={path}>{label}<span aria-hidden="true">→</span></a>)}</div>
  </nav>;
}

export function PageOutline({ sections }) {
  return <aside className="page-outline" aria-label="On this page">
    <p>On this page</p>
    <nav aria-label="Page sections">{sections.map(([id, title]) => <a key={id} href={`#${id}`}>{title}</a>)}</nav>
  </aside>;
}

export function DocumentationOverview() {
  return <div className="doc-content">
    <div className="doc-hero">
      <div className="doc-eyebrow"><span className="doc-status-dot" /> Benchmark documentation</div>
      <h2 className="doc-hero-title">Do value models understand<br className="desktop-break" /> robotic execution?</h2>
      <p>Go beyond outcome prediction. Explore a fine-grained sim-and-real benchmark for task understanding, progress, failure and recovery, and value consistency.</p>
      <div className="doc-actions">
        <a className="doc-action-primary" href="/doc/get-started/">Get started <span aria-hidden="true">→</span></a>
        <a className="doc-action-secondary" href="/doc/model-api/">Connect a model API <span aria-hidden="true">↗</span></a>
      </div>
      <div className="doc-hero-flow" aria-label="Evaluation workflow">
        <span>Model service</span><span aria-hidden="true">→</span><span>Organizer-run evaluation</span><span aria-hidden="true">→</span><span>Capability profile</span>
      </div>
    </div>
    <div className="doc-stat-grid" aria-label="Dataset at a glance">
      <div><strong>35</strong><span>manipulation tasks</span><small>15 simulation · 20 real-world</small></div>
      <div><strong>3,500</strong><span>training demonstrations</span><small>100 per task · standard ID</small></div>
      <div><strong>2,792</strong><span>held-out test trajectories</span><small>Private · organizer-run evaluation</small></div>
    </div>
    <Section id="about-robovalue" title="Understand the feedback, not just the ranking">
      <p>Strong outcome prediction does not guarantee reliable execution understanding. A value can rise during regression, rebound after an unsuccessful recovery, or miss different histories behind similar observations. RoboValue tests these gaps through four complementary capabilities.</p>
      <div className="doc-capability-grid">
        {[
          ['01', 'Task-State Understanding', 'Does the judgment reflect the intended task and current subtask?'],
          ['02', 'Temporal Progress Monitoring', 'Does it track progress, regression, and execution history?'],
          ['03', 'Failure and Recovery Reasoning', 'Does it recognize errors and distinguish recovery attempts from outcomes?'],
          ['04', 'Value Consistency', 'Is feedback stable and consistent across valid execution orders?'],
        ].map(([number, title, description]) => <div key={number}><span className="doc-card-index">{number}</span><h3>{title}</h3><p>{description}</p></div>)}
      </div>
      <p>Scalar values, ordered comparisons, and subtask descriptions connect heterogeneous models to shared metrics while preserving their native value semantics. Read <a href="/doc/get-started/protocol/">Protocol &amp; Metrics</a> for the scoring rules.</p>
    </Section>
    <Section id="private-test-evaluation" title="A clear boundary between training and testing">
      <PrivateTestNotice />
      <p>Training demonstrations and the held-out test split are separate. Providers prepare permitted training references on their model-service side; the RoboValue team manages test queries, annotations, scoring, and reporting.</p>
    </Section>
    <Section id="explore-documentation" title="Choose your next step">
      <div className="doc-reading-cards">
        {[
          ['/doc/get-started/data/', 'Explore the dataset', 'Training and test splits, observations, diagnostic trajectories, and evaluation tracks.'],
          ['/doc/model-api/', 'Connect your model', 'The implemented inference contract, organizer configuration, and a synthetic mock example.'],
          ['/doc/get-started/protocol/', 'Understand the metrics', 'Four capability dimensions, score directions, eligibility, and result interpretation.'],
          ['/doc/simulation-tasks/', 'Browse the tasks', 'Explore the simulation catalog, then visit the real-world task collection.'],
        ].map(([path, title, description]) => <a key={path} href={path}><span className="doc-reading-card-title">{title}<span aria-hidden="true">↗</span></span><p>{description}</p></a>)}
      </div>
      <div className="doc-resource-row"><a href="https://github.com/RoboValue-Benchmark/RoboValue">Code on GitHub ↗</a><a href="/leaderboard/">Leaderboard ↗</a><a href="/doc/real-world-tasks/">Real-world tasks ↗</a><button disabled title="Publication link to be added">Paper · coming soon</button></div>
    </Section>
    <Section id="citation" title="Cite our work"><p>Citation details will be added when the publication link is available.</p></Section>
  </div>;
}

export function GetStarted() {
  return <div className="doc-content">
    <p className="doc-lead">Understand the benchmark, provide your model API, and work with the RoboValue team on organizer-run evaluation.</p>
    <PrivateTestNotice />
    <Section id="recommended-path" title="Recommended reading path">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/data/">Dataset Overview</a><p>Understand the training/test split, observations, and diagnostic trajectory design. This is a description of the benchmark, not a test-set download page.</p></li>
        <li><a href="/doc/get-started/protocol/">Protocol &amp; Metrics</a><p>Choose the relevant evaluation setting and learn what each capability score does—and does not—establish.</p></li>
        <li><a href="/doc/get-started/adapters/">Submit a Model</a><p>Describe your model’s native inputs, outputs, and evaluation setting before coordinating API integration.</p></li>
        <li><a href="/doc/get-started/evaluation/">Evaluation Workflow</a><p>Follow the path from integration discussions to organizer-run testing and result interpretation.</p></li>
        <li><a href="/leaderboard/">Leaderboard</a><p>Explore published capability profiles, setting-specific results, and the snapshot’s aggregate scoring rules.</p></li>
      </ol>
    </Section>
    <Section id="evaluation-responsibilities" title="Who does what">
      <dl className="doc-definition-list"><div><dt>Participants</dt><dd>Provide access to a model API and explain the model’s input context, output semantics, and requested evaluation setting. Prepare any permitted, designated training references on the model-service side before evaluation. Deployment of that API is model-side work, not installation of the hidden-test benchmark.</dd></div><div><dt>RoboValue team</dt><dd>Specify the eligible training references and conduct evaluation on the held-out test trajectories using the applicable query, scoring, and aggregation protocols. The inference client does not read or upload reference demonstrations.</dd></div><div><dt>Public documentation</dt><dd>Describe the benchmark, the v2 model-inference contract, and how to interpret results. Confirm the evaluation package version and integration arrangements with the team; the contract is not a public submission platform.</dd></div></dl>
    </Section>
    <Section id="before-participating" title="Before participating">
      <p>Distinguish Zero-Shot from One-Shot / Few-Shot evaluation and record the demonstration count, preserve the model’s native value semantics, and identify which observation context and output capabilities it supports. A single overall rank is not a substitute for the diagnostic profile.</p>
      <p>When the setting permits references, prepare the designated training demonstrations in your model service before evaluation. Inference requests do not include them. See <a href="/doc/get-started/adapters/#submission-inputs">model-side preparation</a> for the reference selection and input requirements.</p>
      <p>For participation and integration questions, use the existing <a href="/community/">Community</a> contact channel. Do not post API keys or other credentials publicly.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/adapters/", 'Submit a Model'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/simulation-tasks/", 'Simulation Tasks'], ["/doc/real-world-tasks/", 'Real-World Tasks']]} />
  </div>;
}

export function DatasetOverview() {
  return <div className="doc-content">
    <p className="doc-lead">Expert demonstrations for model preparation. Separate diagnostic trajectories for evaluation. One sim-and-real benchmark across 35 manipulation tasks.</p>
    <div className="doc-split-grid" aria-label="Training and test split comparison">
      <a href="#dataset-training" className="doc-split-card"><span className="doc-pill">Training split</span><strong>3,500</strong><p>expert demonstrations</p><small>100 per task · standard ID conditions</small><span className="doc-split-footer">Download link pending <span aria-hidden="true">↓</span></span></a>
      <a href="#dataset-test" className="doc-split-card is-private"><span className="doc-pill">Private test split</span><strong>2,792</strong><p>held-out trajectories</p><small>ID · cross-environment · cross-embodiment</small><span className="doc-split-footer">Organizer-run evaluation <span aria-hidden="true">↗</span></span></a>
    </div>
    <Section id="dataset-training" title="Training demonstrations">
      <p>The training split contains 100 expert demonstrations for each of the 15 simulation and 20 real-world tasks. All demonstrations are collected under the standard in-domain setting and are separate from test trajectories.</p>
      <p>Training data does not include subtask boundary annotations. Annotations constructed for a model’s adaptation are separate from the benchmark’s test-set labels.</p>
      <div className="doc-download-panel"><div><strong>Training data on Hugging Face</strong><p>The download destination has not been published. Real-world release details will be confirmed separately.</p></div><TrainingDownloadLink /></div>
    </Section>
    <Section id="dataset-test" title="A private, held-out test split">
      <p>Test trajectories cover standard conditions and separate environment and embodiment shifts. Annotations support subtask identification, failure localization, recovery-stage reasoning, and cross-solution comparisons.</p>
      <PrivateTestNotice />
      <p>Public task pages illustrate task specifications and representative executions. They are not a download interface for the held-out trajectories or evaluation labels.</p>
    </Section>
    <Section id="dataset-settings" title="Evaluation settings and demonstration access">
      <div className="doc-track-grid">
        <div><span className="doc-pill">No task-specific demonstrations</span><h3>Zero-Shot</h3><p>Released checkpoints, with no task-specific adaptation or reference demonstrations.</p></div>
        <div><span className="doc-pill">Limited demonstrations</span><h3>One-Shot / Few-Shot</h3><p>One-Shot uses one demonstration per task. Few-Shot uses a limited, agreed number. Both use designated training assets for conditioning or task-specific adaptation.</p></div>
        <div className="is-planned"><span className="doc-pill">Planned</span><h3>Full-Data</h3><p>Training or fine-tuning on the complete training split. Not a currently available evaluation ranking.</p></div>
      </div>
      <p>Environment and embodiment shifts are evaluated separately, without additional adaptation to the shifted conditions. Track access is distinct from an API operation or input-sampling profile.</p>
    </Section>
    <Section id="dataset-references" title="Training references are prepared by the provider">
      <p>When the setting permits a reference, RoboValue designates the eligible training assets and the model provider prepares them in the service before evaluation. The inference client does not read, sample, or upload reference videos.</p>
      <aside className="doc-note"><strong>A reference pool is not a shot count.</strong><p>For real-world integration, the eligible pool is the first 20 training trajectories in the organizer-confirmed ordering; simulation assets are designated separately. One-Shot uses one demonstration per task; Few-Shot uses the agreed limited number. Neither automatically uses every trajectory in the pool.</p></aside>
      <p>Confirm the exact assets and ordering with the team, freeze reference selection and preparation, and record changes in the model or preprocessing version. See <a href="/doc/model-api/#api-references">model-side preparation</a>.</p>
    </Section>
    <Section id="dataset-observations" title="Dataset observations and API inputs are different">
      <p>Trajectories contain synchronized RGB-D observations from a head-mounted camera and two wrist-mounted cameras, together with robot states and action targets. This describes the dataset, not the current wire interface.</p>
      <p>The implemented model API sends only the required RGB images or frame sequences and task instructions. Views, history, and sampling are agreed explicitly; depth, robot states, actions, and streaming sessions are outside that contract.</p>
    </Section>
    <Section id="dataset-diagnostics" title="Executions designed to reveal specific gaps">
      <dl className="doc-definition-list"><div><dt>Expert demonstrations</dt><dd>Successful executions support progress ordering and instruction-grounding tests.</dd></div><div><dt>Failure and recovery</dt><dd>Continued error, effective recovery, and ineffective recovery separate failure recognition, corrective attempts, and outcomes.</dd></div><div><dt>Long-horizon temporal trajectories</dt><dd>Repeated actions and visually similar states test whether judgments depend on execution history.</dd></div><div><dt>Multi-solution trajectories</dt><dd>Alternative valid subtask orders test whether semantic progress remains consistent across solutions.</dd></div></dl>
    </Section>
    <Section id="dataset-access" title="From training access to test evaluation">
      <p>Training-data access does not grant access to the held-out test split. To participate, provide a model API and coordinate organizer-run evaluation through <a href="/community/">Community</a>.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Model API'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/protocol/", 'Protocol & Metrics']]} />
  </div>;
}
