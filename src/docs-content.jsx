import React from 'react';
import { Figure } from './benchmark';
import { GROUPS, METRICS } from './benchmark-metrics';
import { metricDocumentation } from './docs-metrics';

export function EvaluationWorkflow() {
  return <div className="doc-content">
    <p className="doc-lead">Follow the evaluation process from model submission and adapter review to testing and results. The RoboValue team runs the evaluation; you do not need a local copy of the private test set.</p>
    <PrivateTestNotice />
    <Section id="workflow-discuss" title="1. Discuss your model">
      <p>Describe your model and its version, the evaluation setting you want—Zero-Shot, One-Shot, or Few-Shot—and the inputs and predictions it supports. Public contact details have not been published yet; the <a href="/community/">Community</a> page is currently a placeholder.</p>
      <p>Read <a href="/doc/get-started/adapters/">Submit a Model</a> for the adapter and service handoff checklist.</p>
    </Section>
    <Section id="workflow-connect" title="2. Hand over and review the adapter">
      <p>Provide a working inference service and the source for its model-specific adapter. The adapter prepares the model’s inputs, calls the service, and returns predictions in the format expected by the benchmark. Your service can keep its own request and response format.</p>
      <p>The RoboValue team reviews the adapter, supported predictions, model and preprocessing versions, input and history requirements, and output semantics. Include a synthetic example to check the integration without private test observations. See <a href="/doc/model-api/">Service &amp; Adapter</a> for the reference implementation.</p>
      <p>Use HTTPS and share credentials privately, not in public documentation or Community messages. An externally hosted API receives the observations needed for inference. If observations must not leave the organizer environment, the model service must be hosted within that environment. Confirm data-handling arrangements and the evaluation package version during integration.</p>
    </Section>
    <Section id="workflow-evaluate" title="3. Organizer-run evaluation">
      <p>The RoboValue team runs the reviewed adapter on held-out test trajectories under the agreed setting and applicable benchmark protocol. When the setting permits references, the provider prepares the designated training demonstrations on the model side before evaluation; RoboValue does not upload reference videos with each query.</p>
      <p>Evaluation preserves each model’s native output semantics and required observation context. Results report simulation and real-world coverage separately, with ID, ENV-OOD, and EMB-OOD conditions identified. Metrics without supported or eligible coverage are reported as N/A, not zero.</p>
      <p>See <a href="/doc/get-started/protocol/">Protocol &amp; Metrics</a> for the scoring rules and how to interpret results.</p>
    </Section>
    <Section id="workflow-results" title="4. Read the results">
      <p>Read the setting, task/domain coverage, metric direction, and protocol context before comparing scores. Diagnostic metrics expose different strengths and limitations; a strong success score does not establish reliable failure or recovery reasoning.</p>
      <p>The <a href="/leaderboard/">Leaderboard</a> displays existing manuscript results. Its published aggregate ranking follows its own documented rules; completing an evaluation is not a promise of automatic publication or immediate inclusion on that page.</p>
    </Section>
    <Section id="workflow-questions" title="Common questions">
      <dl className="doc-definition-list"><div><dt>Can I download the test set and run it locally?</dt><dd>No. The held-out test set is private; participants provide an inference service and adapter for evaluation by the RoboValue team.</dd></div><div><dt>Must I change my service to a shared API format?</dt><dd>No. Your model-specific adapter connects your native service to the benchmark. Implement only the prediction methods the model supports.</dd></div><div><dt>Which training trajectories are used?</dt><dd>For each task, One-Shot always uses the first trajectory in the supplied training-set order. Few-Shot uses all 100 training trajectories for that task. The provider prepares them on the model side before evaluation.</dd></div><div><dt>Where can I ask integration questions?</dt><dd>Public contact details have not been published yet. The <a href="/community/">Community</a> page remains a placeholder. Keep credentials out of public discussions.</dd></div></dl>
    </Section>
    <NextSteps links={[["/doc/get-started/adapters/", 'Submit a Model'], ["/doc/get-started/protocol/", 'Protocol & Metrics'], ["/leaderboard/", 'Explore published results']]} />
  </div>;
}

export function SubmitModel() {
  return <div className="doc-content">
    <p className="doc-lead">Prepare an inference service and hand over a model-specific adapter for review. You provide native predictions; the RoboValue team handles the private test set and scoring.</p>
    <Section id="submission-participation" title="Before you submit">
      <p>Prepare your model information using the checklist below. There is no public submission portal at present, and contact details have not yet been published on the <a href="/community/">Community</a> page. Once a contact channel is available, share connection details and credentials privately.</p>
    </Section>
    <Section id="submission-context" title="Describe the model you want evaluated">
      <ol className="doc-reading-path">
        <li><strong>Identify the model version.</strong><p>Specify the model or checkpoint version and the preprocessing or prompt revision. Keep these fixed during evaluation.</p></li>
        <li><strong>Choose the evaluation setting.</strong><p>Specify Zero-Shot, One-Shot, or Few-Shot. For reference-based evaluation, follow the training-reference selection rules below.</p></li>
        <li><strong>Describe input preparation.</strong><p>Document required camera views, execution history, frame sampling, padding, and preprocessing. Confirm that the required observations are available.</p></li>
        <li><strong>Describe the predictions.</strong><p>Explain the meaning, units, direction, and supported methods of the model’s outputs.</p></li>
      </ol>
    </Section>
    <Section id="submission-capabilities" title="Declare only the operations you support">
      <p>A model does not have to implement all three operations. Scalar value, ordered comparison, and subtask text support different metric coverage. Unsupported coverage is N/A, not zero.</p>
      <p>The <a href="/doc/model-api/#adapter-interfaces">adapter method table</a> explains the scalar, comparison, and textual interfaces.</p>
    </Section>
    <Section id="submission-api" title="Hand over your service and adapter">
      <p>Provide the adapter source and dependencies, the service endpoint and input/output specification, and a synthetic integration example. Your adapter prepares model inputs and calls the service.</p>
      <p>Follow <a href="/doc/model-api/">Service &amp; Adapter</a> for the published reference adapter and the <a href="/doc/model-api/#adapter-handoff">handoff checklist</a>. Share authentication instructions separately, without embedding API keys in code or configuration.</p>
    </Section>
    <Section id="submission-inputs" title="Prepare permitted training references beforehand">
      <p>For each task, the One-Shot reference is always the first trajectory in the supplied training-set order, not an independently selected demonstration. Few-Shot uses all 100 training trajectories for that task. The same rule applies to simulation and real-world tasks.</p>
      <p>Prepare these references on the model side before evaluation, rather than uploading training videos with every query. Preserve the supplied ordering and freeze preprocessing. Document how your adapter/service uses them; see <a href="/doc/get-started/data/#dataset-references">training references</a>.</p>
    </Section>
    <Section id="submission-semantics" title="Preserve native output semantics">
      <p>Keep the model’s native prediction target, units, and direction; RoboValue does not require a common min–max normalization. For comparisons, declare whether the adapter uses the model’s native comparison or <code>V(b) − V(a)</code>. These are distinct choices, not automatic fallbacks. For SIA, return a predicted subtask description; the RoboValue team’s judge computes the score.</p>
    </Section>
    <Section id="submission-contact" title="Coordinate evaluation">
      <p>The test set is private. The organizers prepare queries, compute metrics, and report results under the agreed protocol. Follow <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for the responsibilities and reporting steps.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Service & Adapter'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/community/", 'Community']]} />
  </div>;
}

export function ProtocolGuide() {
  return <div className="doc-content">
    <p className="doc-lead">Learn what each metric measures, which trajectories it covers, and how to read its score. The metrics diagnose complementary capabilities rather than reducing model quality to a single rank.</p>
    <Section id="protocol-settings" title="Evaluation settings">
      <dl className="doc-definition-list"><div><dt>Zero-Shot</dt><dd>Evaluate the model without task-specific adaptation or training references. Publicly released weights are not required for service-based participation.</dd></div><div><dt>One-Shot / Few-Shot</dt><dd>Use standard-scenario training demonstrations from the same task for conditioning or task-specific adaptation, separate from held-out test trajectories. One-Shot always uses the first trajectory in the supplied training-set order. Few-Shot uses all 100 training trajectories for that task. The same selection rule applies to simulation and real-world tasks.</dd></div><div><dt>Generalization</dt><dd>Evaluate a changed embodiment or environment without further adaptation to the shifted condition.</dd></div><div><dt>Full-Data (planned)</dt><dd>A separate track for training or fine-tuning across the complete training split. It is not a currently available evaluation ranking.</dd></div></dl>
      <p>This is the current reference-selection policy. Existing published results retain their recorded evaluation settings; this page does not re-evaluate those snapshots.</p>
      <Figure src="/assets/benchmark-overview.svg" alt="RoboValue shared model interfaces and four diagnostic capability dimensions" caption="Four complementary dimensions diagnose execution understanding while preserving model-specific value semantics." />
    </Section>
    <Section id="protocol-coverage" title="Domains and coverage">
      <p><strong>ID</strong> is the standard in-domain condition; <strong>ENV-OOD</strong> changes the environment; <strong>EMB-OOD</strong> changes the embodiment. Simulation and real-world results are separate coverage axes, not interchangeable observations.</p>
      <p>Each metric has its own eligible trajectories, exclusions, and task/domain aggregation order. Missing or unsupported coverage is <strong>N/A</strong>, not zero. The published tables report TRR and CSVC only in ID; they do not establish OOD coverage for those metrics.</p>
      <p>There is no single averaging rule for all metrics, and native model outputs are not subject to a common min–max normalization. The published leaderboard uses a separate aggregate scoring policy, described below.</p>
    </Section>
    {GROUPS.map(group => <Section key={group.id} id={`protocol-${group.id}`} title={group.title}>
      <p>{group.description}</p>
      {group.metrics.map(key => {
        const metric = METRICS[key];
        const contract = metricDocumentation[key];
        return <article className="doc-metric-contract" key={key} aria-labelledby={`metric-${key}-title`}>
          <h3 id={`metric-${key}`}><span id={`metric-${key}-title`}>{metric.label} {metric.lower ? '↓' : '↑'}{metric.name !== metric.label && ` · ${metric.name}`}</span><a className="doc-heading-anchor" href={`#metric-${key}`} aria-label={`Link to ${metric.label}`}>#</a></h3>
          <p className="doc-metric-aliases">{contract.aliases}</p>
          <p className="doc-metric-purpose">{contract.purpose}</p>
          <dl className="doc-contract-rules"><div><dt>Coverage</dt><dd>{contract.cohort}</dd></div><div><dt>Scoring rule</dt><dd>{contract.rules}</dd></div><div><dt>Interpretation</dt><dd>{contract.interpretation}</dd></div></dl>
        </article>;
      })}
    </Section>)}
    <Section id="metric-sia" title="Subtask Identification Accuracy (SIA) ↑">
      <p>SIA evaluates whether a generated description matches the annotated active subtask. A textual description is an intermediate model response, not a completed score.</p>
      <p>The judging stage uses forced-choice candidate probabilities and retains the probability assigned to the ground-truth subtask. Aggregate those probabilities geometrically within each task, then follow the recorded task/domain protocol. Do not replace this with an arithmetic mean of query probabilities, hard-label accuracy, or one global geometric mean across all tasks.</p>
      <p>SIA is reported separately and contributes no weight to the current aggregate leaderboard. Read its coverage and setting alongside the reported probability score. Implementation key: <code>sia</code>; paper naming aliases do not change the contract.</p>
    </Section>
    <Section id="protocol-results" title="Read the results">
      <ol className="doc-reading-path"><li><strong>Select the evaluation track.</strong><p>Keep Zero-Shot, One-Shot, and Few-Shot results distinct, including the demonstration count. The existing published snapshot has separate Zero-Shot and One-Shot rankings; these are not Few-Shot results.</p></li><li><strong>Select the condition and check coverage.</strong><p>Separate standard, embodiment-shift, and environment-shift results. An unreported cell is not a measured zero.</p></li><li><strong>Read the metric direction and units.</strong><p>The current website tables display scores ×100. FPL is lower-is-better; the other displayed primary metrics are higher-is-better.</p></li><li><strong>Compare capability profiles before overall ranks.</strong><p>Success, grounding, progress, failure/recovery, and consistency diagnose different behaviors. Inspect limitations even when an overall score is high.</p></li></ol>
      <p>The <a href="/leaderboard/#scoring">published aggregate scoring guide</a> documents that snapshot’s normalization, condition/domain weights, capability weights, and missing-metric policy. Its treatment of unmeasured metrics in the aggregate rank does not turn missing scientific coverage into observed zeros.</p>
      <p>VROC, the reverse-half progress correlation, contributes to the published aggregate tracking score but is not separately tabulated in Tables 2–3. Do not infer it from rounded table entries. SIA remains outside the aggregate ranking.</p>
    </Section>
    <Section id="protocol-provenance" title="Current protocol and published results">
      <aside className="doc-notice" aria-label="Protocol and result provenance"><strong>Current rules and published results</strong><p>This guide describes the current author-confirmed protocol, including the October 6, 2026 VOC/VS query alignment and CSVC scoring alignment. The website’s published results retain the October 7, 2026 manuscript snapshot. This documentation update does not recompute those scores.</p></aside>
      <p>In the current protocol, VOC uses the forward half of the Cycle-VOC trajectories rather than a separate trajectory set. VS retains its vs_v1 formula and uses the shared forward-query protocol. CSVC uses the symmetric-ratio rule rather than the earlier RMSE-based rule. Historical TRR sampling selections may differ between simulation and real-world results.</p>
      <p>Read each published result with its recorded protocol and evaluation setting. A newer rule must not be used to reinterpret an older score; a change in trajectory selection or scoring requires a separately versioned result.</p>
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
    ['workflow-connect', 'Adapter handoff and review'],
    ['workflow-evaluate', 'Organizer-run evaluation'],
    ['workflow-results', 'Read the results'],
    ['workflow-questions', 'Common questions'],
  ],
  submission: [
    ['submission-participation', 'Participation'],
    ['submission-context', 'Describe your model'],
    ['submission-capabilities', 'Native model capabilities'],
    ['submission-api', 'Service and adapter handoff'],
    ['submission-inputs', 'Training references'],
    ['submission-semantics', 'Preserve value semantics'],
    ['submission-contact', 'Coordinate evaluation'],
  ],
  protocol: [
    ['protocol-settings', 'Evaluation settings'],
    ['protocol-coverage', 'Domains and coverage'],
    ...GROUPS.map(group => [`protocol-${group.id}`, group.title]),
    ['metric-sia', 'Subtask identification'],
    ['protocol-results', 'Read the results'],
    ['protocol-provenance', 'Current protocol and published results'],
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
    <p>RoboValue uses a private, held-out test set. Participants provide an inference service and a model-specific adapter, and the RoboValue team conducts the evaluation. The test set is not publicly released for download or local evaluation.</p>
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
        <a className="doc-action-secondary" href="/doc/model-api/">Provide a service &amp; adapter <span aria-hidden="true">↗</span></a>
      </div>
      <div className="doc-hero-flow" aria-label="Evaluation workflow">
        <span>Model service</span><span aria-hidden="true">→</span><span>Organizer-run evaluation</span><span aria-hidden="true">→</span><span>Capability profile</span>
      </div>
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
          ['/doc/model-api/', 'Connect your model', 'Provide a native inference service and hand over a model-specific adapter for review.'],
          ['/doc/get-started/protocol/', 'Understand the metrics', 'Four capability dimensions, score directions, eligibility, and result interpretation.'],
          ['/doc/simulation-tasks/', 'Browse the tasks', 'Explore the simulation catalog, then visit the real-world task collection.'],
        ].map(([path, title, description]) => <a key={path} href={path}><span className="doc-reading-card-title">{title}<span aria-hidden="true">↗</span></span><p>{description}</p></a>)}
      </div>
      <div className="doc-resource-row"><a href="https://github.com/RoboValue-Benchmark/RoboValue">Code repository ↗</a><a href="/leaderboard/">Leaderboard ↗</a><a href="/doc/real-world-tasks/">Real-world tasks ↗</a><button disabled title="Publication link to be added">Paper · coming soon</button></div>
    </Section>
    <Section id="citation" title="Cite our work"><p>Citation details will be added when the publication link is available.</p></Section>
  </div>;
}

export function GetStarted() {
  return <div className="doc-content">
    <p className="doc-lead">Understand the benchmark, prepare your inference service and adapter, and hand over the integration for organizer-run evaluation.</p>
    <PrivateTestNotice />
    <Section id="recommended-path" title="Recommended reading path">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/data/">Dataset Overview</a><p>Understand the training/test split, observations, and diagnostic trajectory design. This is a description of the benchmark, not a test-set download page.</p></li>
        <li><a href="/doc/get-started/protocol/">Protocol &amp; Metrics</a><p>Choose the relevant evaluation setting and learn what each capability score does—and does not—establish.</p></li>
        <li><a href="/doc/model-api/">Service &amp; Adapter</a><p>Connect your native inference service through a model-specific adapter. Start from the published reference implementation.</p></li>
        <li><a href="/doc/get-started/adapters/">Submit a Model</a><p>Prepare the adapter source, model/service description, native prediction semantics, and evaluation setting for review.</p></li>
        <li><a href="/doc/get-started/evaluation/">Evaluation Workflow</a><p>Follow the path from integration discussions to organizer-run testing and result interpretation.</p></li>
      </ol>
    </Section>
    <Section id="evaluation-responsibilities" title="Who does what">
      <dl className="doc-definition-list"><div><dt>Participants</dt><dd>Provide a working inference service and its model-specific adapter. Document inputs, outputs, dependencies, and versions, and prepare any permitted training references before evaluation.</dd></div><div><dt>RoboValue team</dt><dd>Provide the training-set ordering, review the adapter, and conduct evaluation on the held-out test set. The team manages test queries, annotations, scoring, and result reporting.</dd></div></dl>
    </Section>
    <Section id="before-participating" title="Before participating">
      <p>Choose the evaluation setting, identify the inputs and predictions your model supports, and document its native output semantics. Keep Zero-Shot, One-Shot, and Few-Shot results distinct.</p>
      <p>For each task, One-Shot always uses the first training trajectory in the supplied order; Few-Shot uses all 100 training trajectories. Prepare these references on the model side before evaluation, not with every query. See <a href="/doc/get-started/data/#dataset-references">training-reference selection</a> for details.</p>
      <p>The <a href="/community/">Community</a> page is currently a placeholder; public participation and integration contact details have not been published yet. Do not post API keys or other credentials publicly.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/adapters/", 'Submit a Model'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/simulation-tasks/", 'Simulation Tasks'], ["/doc/real-world-tasks/", 'Real-World Tasks']]} />
  </div>;
}

export function DatasetOverview() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue separates training demonstrations for model preparation from private test trajectories for evaluation, across both simulation and real-world tasks.</p>
    <Section id="dataset-training" title="Training demonstrations">
      <p>Each task has 100 expert training demonstrations, collected under standard in-domain conditions and separate from the test trajectories.</p>
      <p>Training data does not include subtask boundary annotations. Annotations constructed for a model’s adaptation are separate from the benchmark’s test-set labels.</p>
      <div className="doc-download-panel"><div><strong>Training data on Hugging Face</strong><p>The download link will be added here when available.</p></div><TrainingDownloadLink /></div>
    </Section>
    <Section id="dataset-test" title="A private, held-out test split">
      <p>Test trajectories cover standard conditions and separate environment and embodiment shifts. Annotations support subtask identification, failure localization, recovery-stage reasoning, and cross-solution comparisons.</p>
      <PrivateTestNotice />
      <p>Public task pages illustrate task specifications and representative executions. They are not a download interface for the held-out trajectories or evaluation labels.</p>
    </Section>
    <Section id="dataset-settings" title="Evaluation settings and demonstration access">
      <div className="doc-track-grid">
        <div><span className="doc-pill">No task-specific demonstrations</span><h3>Zero-Shot</h3><p>Evaluate without task-specific adaptation or training references.</p></div>
        <div><span className="doc-pill">Task training demonstrations</span><h3>One-Shot / Few-Shot</h3><p>Use the task’s designated training references, prepared on the model side before evaluation. The selection rules are listed below.</p></div>
        <div className="is-planned"><span className="doc-pill">Planned</span><h3>Full-Data</h3><p>Training or fine-tuning on the complete training split. Not a currently available evaluation ranking.</p></div>
      </div>
      <p>Environment and embodiment shifts are evaluated separately, without additional adaptation to the shifted conditions. State the evaluation setting independently of the adapter’s supported prediction methods.</p>
    </Section>
    <Section id="dataset-references" title="Training references are prepared by the provider">
      <p>References come from the training split of the task being evaluated. The provider prepares them on the model side before evaluation and documents their use in the adapter/service. RoboValue does not upload reference videos with each query.</p>
      <aside className="doc-note"><strong>Fixed selection for each task.</strong><p>One-Shot always uses the first trajectory in the supplied training-set order; do not choose a different demonstration. Few-Shot uses all 100 training trajectories for that task. The same rule applies to simulation and real-world tasks.</p></aside>
      <p>Preserve the supplied trajectory ordering and freeze model-side preparation. Record changes in the model or preprocessing version. Never use held-out test trajectories as references. See <a href="/doc/model-api/#adapter-access">reference preparation and data access</a>.</p>
    </Section>
    <Section id="dataset-observations" title="Dataset observations and model inputs">
      <p>Trajectories contain synchronized RGB-D observations from a head-mounted camera and two wrist-mounted cameras, together with robot states and action targets. This describes the dataset, not a mandatory service payload.</p>
      <p>Document the observations your model needs and agree on their availability with the team. The model-specific adapter owns view selection, history, frame sampling, and preprocessing. Do not assume every recorded modality is provided to a service or that every model receives the same frame sequence.</p>
    </Section>
    <Section id="dataset-diagnostics" title="Executions designed to reveal specific gaps">
      <dl className="doc-definition-list"><div><dt>Expert demonstrations</dt><dd>Successful executions support progress ordering and instruction-grounding tests.</dd></div><div><dt>Failure and recovery</dt><dd>Continued error, effective recovery, and ineffective recovery separate failure recognition, corrective attempts, and outcomes.</dd></div><div><dt>Long-horizon temporal trajectories</dt><dd>Repeated actions and visually similar states test whether judgments depend on execution history.</dd></div><div><dt>Multi-solution trajectories</dt><dd>Alternative valid subtask orders test whether semantic progress remains consistent across solutions.</dd></div></dl>
    </Section>
    <Section id="dataset-access" title="From training access to test evaluation">
      <p>Training-data access does not grant access to the held-out test split. Participation uses an inference service and model-specific adapter, reviewed and run by the RoboValue team. The <a href="/community/">Community</a> page remains a placeholder. See <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for the responsibilities.</p>
    </Section>
    <NextSteps links={[["/doc/model-api/", 'Service & Adapter'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/protocol/", 'Protocol & Metrics']]} />
  </div>;
}
