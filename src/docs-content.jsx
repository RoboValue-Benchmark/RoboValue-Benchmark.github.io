import React from 'react';

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
        <a className="doc-action-secondary" href="/doc/get-started/evaluation/">Evaluation workflow <span aria-hidden="true">↗</span></a>
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
      <p>The RoboValue team supplies One-Shot references on the evaluation side. Participants may download the training set for Full-Shot fine-tuning. Test trajectories and annotations remain private.</p>
    </Section>
    <Section id="explore-documentation" title="Choose your next step">
      <div className="doc-reading-cards">
        {[
          ['/doc/get-started/data/', 'Dataset Overview&Download', 'Find the training-data download entry and learn about training and evaluation trajectories.'],
          ['/doc/get-started/evaluation/', 'Evaluation Workflow', 'Follow model submission, closed-source service integration, and organizer-run evaluation step by step.'],
          ['/doc/get-started/protocol/', 'Understand the metrics', 'Four capability dimensions, score directions, eligibility, and result interpretation.'],
          ['/doc/simulation-tasks/', 'Browse the tasks', 'Explore the simulation catalog, then visit the real-world task collection.'],
        ].map(([path, title, description]) => <a key={path} href={path}><span className="doc-reading-card-title">{title}<span aria-hidden="true">→</span></span><p>{description}</p></a>)}
      </div>
    </Section>
    <Section id="citation" title="Cite our work"><p>Citation details will be added when the publication link is available.</p></Section>
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
