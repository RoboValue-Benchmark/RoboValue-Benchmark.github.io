import React from 'react';
import { GROUPS, METRICS } from './benchmark-metrics';
import { metricDocumentation } from './docs-metrics';
import { metricPages } from './navigation';
import { NextSteps, Section } from './docs-content';

export const protocolSections = {
  'evaluation-protocol': [
    ['protocol-evaluation', 'Evaluation'],
    ['protocol-settings', 'Tracks'],
    ['dataset-references', 'Adaptation'],
    ['protocol-coverage', 'Coverage'],
    ['protocol-trajectories', 'Trajectories'],
    ['protocol-inference', 'Inference'],
    ['protocol-integrity', 'Evaluation Integrity'],
    ['protocol-results', 'Results'],
    ['protocol-provenance', 'Protocol Versions'],
  ],
  metrics: [
    ...GROUPS.map(group => [`protocol-${group.id}`, group.short]),
  ],
};

export function ProtocolGuide() {
  return <div className="doc-content">
    <p className="doc-lead">Read the evaluation rules, then explore the metrics that diagnose each capability. The protocol explains how training data, execution context, and test conditions shape a result.</p>
    <div className="doc-reading-cards">
      <a href="/doc/get-started/protocol/evaluation/"><span className="doc-reading-card-title">Evaluation Protocol<span aria-hidden="true">→</span></span><p>Evaluation tracks, reference use, diagnostic trajectories, integrity rules, and result interpretation.</p></a>
      <a href="/doc/get-started/protocol/metrics/"><span className="doc-reading-card-title">Metrics Reference<span aria-hidden="true">→</span></span><p>Four capability dimensions, eligible trajectories, scoring rules, and score directions.</p></a>
    </div>
    <NextSteps links={[["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/data/", 'Dataset Overview']]} />
  </div>;
}

export function EvaluationProtocol() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue evaluates how a model judges recorded robot executions—not how a policy controls a robot. This protocol defines the data each track may use, the conditions being compared, and how predictions become reported results.</p>
    <Section id="protocol-evaluation" title="Evaluation">
      <p>The RoboValue team runs submitted models on a private, held-out test set of simulation and real-world trajectories. Participants provide a model or an inference service with an adapter; the team prepares evaluation queries, computes the metrics, and reports the results. No local test-set installation or robot deployment is required.</p>
      <p>The test trajectories and their annotations are not released for download. A hosted model receives the observations needed for inference, not the ground-truth labels used for scoring. If those observations cannot leave the evaluation environment, the service must run in an organizer-controlled environment.</p>
      <p>See <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for submission and integration steps. The rules below apply to both open-source and closed-source models.</p>
    </Section>
    <Section id="protocol-settings" title="Tracks">
      <p>Tracks distinguish access to task-specific training data. They do not depend on where the model runs or whether its weights are public.</p>
      <div className="doc-table-scroll" role="region" aria-label="Evaluation tracks and permitted training data" tabIndex={0}>
        <table className="doc-contract-table"><thead><tr><th>Track</th><th>Task-Specific Data</th><th>Model Use</th></tr></thead><tbody>
          <tr><td><strong>Zero-Shot</strong></td><td>No reference demonstration or task-specific fine-tuning.</td><td>Evaluate the existing model directly.</td></tr>
          <tr><td><strong>One-Shot</strong></td><td>The first training trajectory for each task.</td><td>The evaluation-side adapter prepares the model’s reference inputs.</td></tr>
          <tr><td><strong>Full-Shot</strong></td><td>All 100 training trajectories for each task.</td><td>Fine-tune the model, then evaluate it through the same inference interface as Zero-Shot.</td></tr>
        </tbody></table>
      </div>
      <p>Report each track separately. The website’s existing published results cover Zero-Shot and One-Shot; adding a Full-Shot track does not turn those scores into Full-Shot results.</p>
    </Section>
    <Section id="dataset-references" title="Adaptation">
      <dl className="doc-definition-list">
        <div><dt>One-Shot Reference</dt><dd>Use the first trajectory in the task’s training split, not a demonstration chosen for a particular test episode. The RoboValue team supplies this trajectory to the organizer-run adapter. The adapter extracts the frames or other reference inputs required by the model; a provider does not need to select or send a new reference for every query.</dd></div>
        <div><dt>Full-Shot Fine-Tuning</dt><dd>Download the task’s complete training split and fine-tune with your own training procedure. Submit the resulting model or service, together with its training setup. Evaluation calls follow the Zero-Shot interface: the training set is not attached to each inference request.</dd></div>
      </dl>
      <p>The same training-data policy applies to simulation and real-world tasks. References and fine-tuning data come from the training split, never from the private test trajectories. Under a shifted evaluation condition, keep the Standard training reference or adapted model; do not adapt again to the shifted test condition.</p>
      <p>Find the training data in <a href="/doc/get-started/data/download/">Download</a>. For adapter examples, see <a href="/doc/model-api/#adapter-example">RoboMeter and Robo-Dopamine</a>.</p>
    </Section>
    <Section id="protocol-coverage" title="Coverage">
      <p>Each track can be evaluated under the following conditions. Generalization changes the robot or its environment without further adaptation; it is not an additional track.</p>
      <dl className="doc-definition-list">
        <div><dt>Standard (ID)</dt><dd>The in-domain condition, using the standard embodiment and environment.</dd></div>
        <div><dt>Cross-Embodiment (EMB-OOD)</dt><dd>A robot-embodiment shift relative to Standard, testing whether execution judgments transfer to another robot platform.</dd></div>
        <div><dt>Cross-Environment (ENV-OOD)</dt><dd>An environment shift relative to Standard, testing whether execution judgments remain reliable in a changed visual context.</dd></div>
      </dl>
      <p>Keep simulation and real-world results separate, and compare conditions within the same track. Consult the <a href="/doc/simulation-tasks/">simulation</a> and <a href="/doc/real-world-tasks/">real-world</a> task catalogs for the corresponding examples.</p>
      <p>Coverage is metric-specific. The published tables report TRR and CSVC only under Standard (ID); those entries do not establish OOD coverage.</p>
    </Section>
    <Section id="protocol-trajectories" title="Trajectories">
      <p>A successful final state is only one test of execution understanding. RoboValue also asks whether values follow progress, distinguish a recovery attempt from a successful correction, and remain consistent across valid solutions.</p>
      <dl className="doc-definition-list">
        <div><dt>Task Understanding</dt><dd><a href="/doc/get-started/protocol/metrics/sa/">SA</a> contrasts successful and unsuccessful executions. <a href="/doc/get-started/protocol/metrics/tga-ct/">TGA-CT</a> and <a href="/doc/get-started/protocol/metrics/tga-cf/">TGA-CF</a> hold the visual execution fixed while changing the instruction. <a href="/doc/get-started/protocol/metrics/sia/">SIA</a> tests the predicted active subtask against its annotation.</dd></div>
        <div><dt>Progress Tracking</dt><dd><a href="/doc/get-started/protocol/metrics/voc/">VOC</a> tracks forward progress in successful execution; <a href="/doc/get-started/protocol/metrics/cycle-voc/">Cycle-VOC</a> adds reverse playback to test whether values also fall when progress is undone. Preserve the continuous forward–reverse history, including the shared turn. The reverse half is a controlled visual diagnostic, not a claim that the robot can physically execute the clip backward.</dd></div>
        <div><dt>Execution History</dt><dd><a href="/doc/diagnostic-trajectories/long-horizon/">Long-Horizon</a> trajectories revisit similar-looking states after repeated actions. <a href="/doc/get-started/protocol/metrics/memory-voc/">Memory-VOC</a> tests accumulated progress with the model’s history-bearing inputs intact; an isolated current image can omit the information needed to distinguish those states.</dd></div>
        <div><dt>Failure–Recovery</dt><dd><a href="/doc/get-started/protocol/metrics/fpl/">FPL</a> measures whether a value decline localizes the annotated failure onset. <a href="/doc/get-started/protocol/metrics/trr/">TRR</a> contrasts three branches from a shared failure scenario: continued error, effective recovery, and ineffective recovery. A corrective attempt is not the same as a corrected outcome. Explore the <a href="/doc/diagnostic-trajectories/failure-and-recovery/">Failure–Recovery</a> examples.</dd></div>
        <div><dt>Value Consistency</dt><dd><a href="/doc/get-started/protocol/metrics/vs/">VS</a> checks that successful-execution values remain stable without becoming uninformatively flat. <a href="/doc/get-started/protocol/metrics/csvc/">CSVC</a> aligns the same semantic subtasks across <a href="/doc/diagnostic-trajectories/multi-solution/">Multi-Solution</a> trajectories, rather than treating different valid action orders as errors.</dd></div>
      </dl>
      <p>These tests use different eligible trajectories and exclusions. Each <a href="/doc/get-started/protocol/metrics/">metric page</a> defines its own cohort, scoring rule, and interpretation; not every metric is computed on every trajectory.</p>
    </Section>
    <Section id="protocol-inference" title="Inference">
      <p>Shared metrics do not require identical model inputs. A model-specific adapter selects the views and execution context its model needs, applies its preprocessing, and maps native predictions into the supported benchmark operations. Camera selection, history, and reference handling must be described as part of the evaluated setup.</p>
      <p>Preserve native value semantics and units; do not impose a common min–max scale on all models. The adapter can map a native output into the benchmark’s score direction, but a model prediction is not itself a metric score. Supported subtask descriptions are scored by the RoboValue team’s judge.</p>
      <p>Implement only the operations the model supports. The supported operations determine which metrics can be evaluated; unsupported coverage remains N/A. See <a href="/doc/model-api/#adapter-interfaces">Integration</a> for the interface contract, rather than substituting placeholder predictions for an unsupported operation.</p>
    </Section>
    <Section id="protocol-integrity" title="Evaluation Integrity">
      <ul>
        <li><strong>Keep training and testing separate.</strong> Use only the training data permitted by the declared track. Private test observations and annotations must not become fine-tuning data, reference demonstrations, or a source of hand-tuned answers.</li>
        <li><strong>Identify the evaluated setup.</strong> Document the checkpoint or service version, preprocessing, prompts, reference handling, and any task-specific training. A change to the model or inference policy must be identified with its result, not silently mixed into an existing run.</li>
        <li><strong>Return predictions, not benchmark scores.</strong> Adapters connect the model to the evaluation inputs. Ground-truth annotations and metric calculation belong to the scoring stage, not to the model’s prediction logic.</li>
        <li><strong>Expose inference failures.</strong> Report service or adapter errors instead of returning fabricated zero predictions. N/A describes missing or unsupported coverage, not a replacement for a failed model call.</li>
      </ul>
      <p>Closed-source participation requires an inference service and adapter handoff, not a public release of model weights. These evaluation rules do not impose a separate open-source requirement. See <a href="/doc/get-started/adapters/">Submission</a> for what to provide.</p>
    </Section>
    <Section id="protocol-results" title="Results">
      <ol className="doc-reading-path">
        <li><strong>Check the setup.</strong><p>Read the model version and track alongside the result. Keep Zero-Shot, One-Shot, and Full-Shot separate, then distinguish simulation from real-world evaluation and Standard from either OOD condition.</p></li>
        <li><strong>Check coverage.</strong><p>Read the evaluated tasks and metrics before comparing models. An unreported or unsupported cell is N/A, not a measured zero; a partial capability profile is not a complete evaluation.</p></li>
        <li><strong>Read directions and units.</strong><p>The current website tables display metric scores ×100. FPL is a normalized localization error, so lower is better; the other displayed primary metrics are higher-is-better. This display scaling does not normalize native model predictions.</p></li>
        <li><strong>Read capabilities before ranks.</strong><p>Outcome discrimination, instruction grounding, progress, recovery, and consistency test different behaviors. A high score in one does not establish the others.</p></li>
      </ol>
      <p>Metric scores follow their own trajectory eligibility and aggregation rules. For the paper’s main-table summary, task scores are averaged within simulation and within the real world, then the two domain averages receive equal weight. This table-level summary does not replace metric-specific calculations or define the leaderboard’s overall ranking.</p>
      <p>The <a href="/leaderboard/#scoring">published aggregate scoring guide</a> separately documents the leaderboard snapshot’s normalization, condition/domain weights, capability weights, and missing-metric policy. Its treatment of unmeasured metrics in an aggregate rank does not turn missing scientific coverage into observed zeros.</p>
      <p>VROC is the reverse-half progress correlation used in the published aggregate tracking score. It is not separately tabulated in the main result tables and cannot be recovered from rounded entries. SIA is reported separately and remains outside the aggregate ranking.</p>
    </Section>
    <Section id="protocol-provenance" title="Protocol Versions">
      <p>Published results retain the October 7, 2026 manuscript snapshot; this documentation update does not recompute those scores. Read each result with its recorded protocol and evaluation setup.</p>
      <p>The current author-confirmed protocol aligns VOC and VS with the shared forward-query protocol and uses the symmetric-ratio rule for CSVC. VOC uses the forward half of Cycle-VOC, while VS retains its vs_v1 formula. Older trajectory selections or scoring rules must not be reinterpreted as the current protocol; a changed protocol requires a separately identified result.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/metrics/", 'Metrics Reference'], ["/doc/get-started/evaluation/", 'Evaluation Workflow']]} />
  </div>;
}

export function MetricsReference() {
  return <div className="doc-content">
    <p className="doc-lead">Choose a metric to read its coverage, scoring rule, and interpretation. Each metric has its own page, grouped by the capability it diagnoses.</p>
    {GROUPS.map(group => <Section key={group.id} id={`protocol-${group.id}`} title={group.short}>
      <p><strong>{group.title}.</strong> {group.description}</p>
      <div className="doc-reading-cards">
        {metricPages.filter(page => page.dimension === group.id).map(page => <a key={page.path} href={page.path}>
          <span className="doc-reading-card-title">{page.title}<span aria-hidden="true">→</span></span>
          <p>{page.metricKey === 'sia' ? 'Subtask Identification Accuracy' : METRICS[page.metricKey].name}</p>
        </a>)}
      </div>
    </Section>)}
    <NextSteps links={[["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol'], ["/leaderboard/", 'Published Results']]} />
  </div>;
}

export function MetricGuide({ metricKey }) {
  if (metricKey === 'sia') return <div className="doc-content">
    <Section id="metric-sia" title="Scoring ↑">
      <p><strong>Subtask Identification Accuracy (SIA)</strong> evaluates whether a generated description matches the annotated active subtask. A textual description is an intermediate model response, not a completed score.</p>
      <p>The judging stage uses forced-choice candidate probabilities and retains the probability assigned to the ground-truth subtask. Aggregate those probabilities geometrically within each task, then follow the recorded task/domain protocol. Do not replace this with an arithmetic mean of query probabilities, hard-label accuracy, or one global geometric mean across all tasks.</p>
      <p>SIA is reported separately and contributes no weight to the current aggregate leaderboard. Read its coverage and setting alongside the reported probability score. Implementation key: <code>sia</code>; paper naming aliases do not change the contract.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/metrics/#protocol-understanding", 'Metrics Reference'], ["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol']]} />
  </div>;
  const metric = METRICS[metricKey];
  const contract = metricDocumentation[metricKey];
  const dimension = metricPages.find(page => page.metricKey === metricKey).dimension;
  return <div className="doc-content">
    <p className="doc-lead"><strong>{metric.name}.</strong> {contract.purpose}</p>
    <p className="doc-metric-aliases">{contract.aliases}</p>
    <Section id={`metric-${metricKey}`} title={`Scoring ${metric.lower ? '↓' : '↑'}`}>
      <dl className="doc-contract-rules"><div><dt>Coverage</dt><dd>{contract.cohort}</dd></div><div><dt>Scoring Rule</dt><dd>{contract.rules}</dd></div><div><dt>Interpretation</dt><dd>{contract.interpretation}</dd></div></dl>
    </Section>
    <NextSteps links={[[`/doc/get-started/protocol/metrics/#protocol-${dimension}`, 'Metrics Reference'], ["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol']]} />
  </div>;
}
