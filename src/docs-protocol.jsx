import React from 'react';
import { Figure } from './benchmark';
import { GROUPS, METRICS } from './benchmark-metrics';
import { metricDocumentation } from './docs-metrics';
import { metricPages } from './navigation';
import { NextSteps, Section } from './docs-content';

export const protocolSections = {
  'evaluation-protocol': [
    ['protocol-settings', 'Evaluation tracks'],
    ['protocol-coverage', 'Domains and coverage'],
    ['protocol-results', 'Read the results'],
    ['protocol-provenance', 'Current rules and published results'],
  ],
  metrics: [
    ...GROUPS.map(group => [`protocol-${group.id}`, group.title]),
  ],
};

export function ProtocolGuide() {
  return <div className="doc-content">
    <p className="doc-lead">Choose an evaluation track, then explore the metrics that diagnose each capability. Protocol details and individual metric definitions have their own pages.</p>
    <div className="doc-reading-cards">
      <a href="/doc/get-started/protocol/evaluation/"><span className="doc-reading-card-title">Evaluation Protocol<span aria-hidden="true">→</span></span><p>Zero-Shot, One-Shot, Full-Shot, domain coverage, and how to read reported results.</p></a>
      <a href="/doc/get-started/protocol/metrics/"><span className="doc-reading-card-title">Metrics Reference<span aria-hidden="true">→</span></span><p>Four capability dimensions, eligible trajectories, scoring rules, and score directions.</p></a>
    </div>
    <NextSteps links={[["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/data/", 'Dataset Overview&Download']]} />
  </div>;
}

export function EvaluationProtocol() {
  return <div className="doc-content">
    <p className="doc-lead">Choose an evaluation track, understand domain coverage, and interpret results under their recorded protocol.</p>
    <Section id="protocol-settings" title="Evaluation Tracks">
      <dl className="doc-definition-list">
        <div><dt>Zero-Shot</dt><dd>Evaluate without task-specific fine-tuning or reference demonstrations.</dd></div>
        <div><dt>One-Shot</dt><dd>Use the first training trajectory for each task as a reference. It is available to the adapter on the evaluation side.</dd></div>
        <div><dt>Full-Shot</dt><dd>Use each task’s full training split—all 100 trajectories—for participant-side fine-tuning. The fine-tuned model uses the same inference interface as Zero-Shot, but its results remain labeled Full-Shot.</dd></div>
      </dl>
      <p>Tracks describe how training data is used, independently of whether a model is open-source or closed-source. Published results retain their recorded use of conditioning or adaptation; this page does not relabel or re-evaluate those snapshots.</p>
      <Figure src="/assets/benchmark-overview.svg" alt="RoboValue shared model interfaces and four diagnostic capability dimensions" caption="Four complementary dimensions diagnose execution understanding while preserving model-specific value semantics." />
    </Section>
    <Section id="protocol-coverage" title="Domains and coverage">
      <p>Generalization evaluates a changed embodiment or environment without further adaptation to the shifted condition. It is a coverage axis, not a fourth evaluation track.</p>
      <p><strong>Standard (ID)</strong> is the in-domain condition; <strong>Cross-Embodiment (EMB-OOD)</strong> changes the robot embodiment; <strong>Cross-Environment (ENV-OOD)</strong> changes the environment. Both shifts are relative to Standard. Simulation and real-world results are reported separately.</p>
      <p>Each metric has its own eligible trajectories, exclusions, and task/domain aggregation order. Missing or unsupported coverage is <strong>N/A</strong>, not zero. The published tables report TRR and CSVC only in ID; they do not establish OOD coverage for those metrics.</p>
      <p>There is no single averaging rule for all metrics, and native model outputs are not subject to a common min–max normalization. The published leaderboard uses a separate aggregate scoring policy, described below.</p>
    </Section>
    <Section id="protocol-results" title="Read the results">
      <ol className="doc-reading-path"><li><strong>Select the evaluation track.</strong><p>Keep Zero-Shot, One-Shot, and Full-Shot results distinct, including the demonstration count. The existing published snapshot has separate Zero-Shot and One-Shot rankings; these are not Full-Shot results.</p></li><li><strong>Select the condition and check coverage.</strong><p>Separate standard, embodiment-shift, and environment-shift results. An unreported cell is not a measured zero.</p></li><li><strong>Read the metric direction and units.</strong><p>The current website tables display scores ×100. FPL is lower-is-better; the other displayed primary metrics are higher-is-better.</p></li><li><strong>Compare capability profiles before overall ranks.</strong><p>Success, grounding, progress, failure/recovery, and consistency diagnose different behaviors. Inspect limitations even when an overall score is high.</p></li></ol>
      <p>The <a href="/leaderboard/#scoring">published aggregate scoring guide</a> documents that snapshot’s normalization, condition/domain weights, capability weights, and missing-metric policy. Its treatment of unmeasured metrics in the aggregate rank does not turn missing scientific coverage into observed zeros.</p>
      <p>VROC, the reverse-half progress correlation, contributes to the published aggregate tracking score but is not separately tabulated in Tables 2–3. Do not infer it from rounded table entries. SIA remains outside the aggregate ranking.</p>
    </Section>
    <Section id="protocol-provenance" title="Current protocol and published results">
      <aside className="doc-notice" aria-label="Protocol and result provenance"><strong>Current rules and published results</strong><p>This guide describes the current author-confirmed protocol, including the October 6, 2026 VOC/VS query alignment and CSVC scoring alignment. The website’s published results retain the October 7, 2026 manuscript snapshot. This documentation update does not recompute those scores.</p></aside>
      <p>In the current protocol, VOC uses the forward half of the Cycle-VOC trajectories rather than a separate trajectory set. VS retains its vs_v1 formula and uses the shared forward-query protocol. CSVC uses the symmetric-ratio rule rather than the earlier RMSE-based rule. Historical TRR sampling selections may differ between simulation and real-world results.</p>
      <p>Read each published result with its recorded protocol and evaluation setting. A newer rule must not be used to reinterpret an older score; a change in trajectory selection or scoring requires a separately versioned result.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/metrics/", 'Metrics Reference'], ["/doc/get-started/evaluation/", 'Evaluation Workflow']]} />
  </div>;
}

export function MetricsReference() {
  return <div className="doc-content">
    <p className="doc-lead">Choose a metric to read its coverage, scoring rule, and interpretation. Each metric has its own page, grouped by the capability it diagnoses.</p>
    {GROUPS.map(group => <Section key={group.id} id={`protocol-${group.id}`} title={group.title}>
      <p>{group.description}</p>
      <div className="doc-reading-cards">
        {metricPages.filter(page => page.dimension === group.id).map(page => <a key={page.path} href={page.path}>
          <span className="doc-reading-card-title">{page.title}<span aria-hidden="true">→</span></span>
          <p>{page.metricKey === 'sia' ? 'Subtask Identification Accuracy' : METRICS[page.metricKey].name}</p>
        </a>)}
      </div>
    </Section>)}
    <NextSteps links={[["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol'], ["/leaderboard/", 'Published results']]} />
  </div>;
}

export function MetricGuide({ metricKey }) {
  if (metricKey === 'sia') return <div className="doc-content">
    <Section id="metric-sia" title="Subtask Identification Accuracy (SIA) ↑">
      <p>SIA evaluates whether a generated description matches the annotated active subtask. A textual description is an intermediate model response, not a completed score.</p>
      <p>The judging stage uses forced-choice candidate probabilities and retains the probability assigned to the ground-truth subtask. Aggregate those probabilities geometrically within each task, then follow the recorded task/domain protocol. Do not replace this with an arithmetic mean of query probabilities, hard-label accuracy, or one global geometric mean across all tasks.</p>
      <p>SIA is reported separately and contributes no weight to the current aggregate leaderboard. Read its coverage and setting alongside the reported probability score. Implementation key: <code>sia</code>; paper naming aliases do not change the contract.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/protocol/metrics/#protocol-understanding", 'Metrics Reference'], ["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol']]} />
  </div>;
  const metric = METRICS[metricKey];
  const contract = metricDocumentation[metricKey];
  const dimension = metricPages.find(page => page.metricKey === metricKey).dimension;
  return <div className="doc-content">
    <p className="doc-lead">{contract.purpose}</p>
    <p className="doc-metric-aliases">{contract.aliases}</p>
    <Section id={`metric-${metricKey}`} title={`${metric.name} ${metric.lower ? '↓' : '↑'}`}>
      <dl className="doc-contract-rules"><div><dt>Coverage</dt><dd>{contract.cohort}</dd></div><div><dt>Scoring rule</dt><dd>{contract.rules}</dd></div><div><dt>Interpretation</dt><dd>{contract.interpretation}</dd></div></dl>
    </Section>
    <NextSteps links={[[`/doc/get-started/protocol/metrics/#protocol-${dimension}`, 'Metrics Reference'], ["/doc/get-started/protocol/evaluation/", 'Evaluation Protocol']]} />
  </div>;
}
