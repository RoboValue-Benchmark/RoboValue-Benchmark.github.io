import React from 'react';
import { GROUPS, METRICS } from './benchmark-metrics';
import { metricDocumentation } from './docs-metrics';
import { metricPages } from './navigation';
import { Section } from './docs-content';
import './protocol-tracks.css';

export const protocolSections = {
  'evaluation-protocol': [
    ['protocol-settings', 'Tracks'],
    ['protocol-evaluation', 'Evaluation'],
    ['protocol-integrity', 'Evaluation Integrity'],
    ['protocol-results', 'Results'],
  ],
  metrics: [
    ...GROUPS.map(group => [`protocol-${group.id}`, group.short]),
  ],
};

export function EvaluationProtocol() {
  return <div className="doc-content">
    <p className="doc-lead">To ensure the fairness and credibility of the result of evaluation, the document below will explain how RoboValue evaluates models in detail, if there are any doubt about the process, please contact us.</p>
    <Section id="protocol-settings" title="Tracks">
      <p> Overall, there are three tracks, categorized by the number of references used. To ensure fairness, each track has its independent leaderboard.</p>
      <div className="doc-protocol-tracks">
        <div className="doc-protocol-track-grid">
          <article className="doc-protocol-track doc-protocol-track--zero" aria-labelledby="protocol-zero-shot">
            <h3 id="protocol-zero-shot">Zero-Shot</h3>
            <p>Evaluate the model directly, without using reference or task-specific adaptation.</p>
          </article>
          <article className="doc-protocol-track doc-protocol-track--one" aria-labelledby="protocol-one-shot">
            <h3 id="protocol-one-shot">One-Shot</h3>
            <p>Evaluate the model using only one reference trajectory per task.</p>
          </article>
          <article className="doc-protocol-track doc-protocol-track--full" aria-labelledby="protocol-full-shot">
            <h3 id="protocol-full-shot">Full-Shot</h3>
            <p>Fine-tune on all 100 training trajectories for each task before evaluation.</p>
          </article>
        </div>
      </div>
    </Section>
    <Section id="protocol-evaluation" title="Evaluation">
      <p>The RoboValue team evaluates models on private test trajectories. We first check whether each model's adapter supports scalar values, pairwise comparisons, or subtask descriptions, then determine which metrics can be evaluated. For each metric, RoboValue constructs queries with the its relevent trajectory and task instructions. The adapter converts these queries into the inputs required by the model, including observation frames, temporal context, and reference information when needed. It then invokes either the local model(open-source) or the submitted inference service(close-source). The team will then computes metric scores from the returned predictions according to scoring rules of the metrics. All tracks use the same test trajectories, scoring rules, and aggregation method.</p>
      <p id="dataset-references">Zero-Shot and Full-Shot follow the same inference workflow, with no reference trajectories supplied during evaluation. Zero-Shot uses the existing model, whereas Full-Shot uses the model fine-tuned on the released training dataset. For One-Shot, the RoboValue team selects one successful reference trajectory for each task in advance. This trajectory is collected under Standard conditions and follows the task's standard execution solution. The reference remains fixed throughout evaluation, so participants do not need to select or supply their own demonstrations.</p>
      <p id="protocol-coverage">The published TRR and CSVC results cover only the Standard condition. See <a href="/doc/get-started/data/overview/#dataset-conditions">Dataset Overview</a> for the condition definitions.</p>
    </Section>
    <Section id="protocol-integrity" title="Evaluation Integrity">
      <p>Training and adaptation must follow the data restrictions of the selected track. The RoboValue team ensures that private test trajectories and their labels are not released as training data and that test trajectories are not used as references. Before evaluation, we review each submitted adapter to check that it prepares the model's required observation context and reference inputs, preserves native output semantics, and excludes test annotations from model inputs and prediction logic, helping guard against cheating and deliberate attempts to game the evaluation. To keep results comparable, the model version and inference procedure remain fixed throughout evaluation, including preprocessing, prompt construction, and observation context preparation. Reference use and any task adaptation are documented with the results. Inference failures are recorded as errors rather than replaced with fabricated predictions.</p>
    </Section>
    <Section id="protocol-results" title="Results">
      <p>After evaluation, we report results separately for each track, domain, and condition. Missing or unsupported metric coverage is marked as N/A.</p>
      <p>To obtain the overall leaderboard score, we first average task scores within each condition and domain, giving simulation and real-world domains equal weight in the overall score. We then combine these scores using the metric score normalization, weights, and missing metric rules defined in the <a href="/leaderboard/#scoring">scoring guide</a>.</p>
    </Section>
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
  </div>;
}

export function MetricGuide({ metricKey }) {
  if (metricKey === 'sia') return <div className="doc-content">
    <Section id="metric-sia" title="Scoring ↑">
      <p><strong>Subtask Identification Accuracy (SIA)</strong> evaluates whether a generated description matches the annotated active subtask. Queries are sampled within annotated subtask intervals, away from boundaries. The model describes the current subtask without being given the candidate labels.</p>
      <p>A separate LLM judge compares each description with the task’s candidate subtasks and retains the probability assigned to the ground-truth subtask. Aggregate those probabilities geometrically within each task, then follow the recorded task/domain protocol. Do not replace this with an arithmetic mean of query probabilities, hard-label accuracy, or one global geometric mean across all tasks.</p>
      <p>SIA is reported separately and contributes no weight to the current aggregate leaderboard. Read its coverage and setting alongside the reported probability score.</p>
    </Section>
  </div>;
  const metric = METRICS[metricKey];
  const contract = metricDocumentation[metricKey];
  return <div className="doc-content">
    <p className="doc-lead"><strong>{metric.name}.</strong> {contract.purpose}</p>
    <Section id={`metric-${metricKey}`} title={`Scoring ${metric.lower ? '↓' : '↑'}`}>
      <dl className="doc-contract-rules"><div><dt>Coverage</dt><dd>{contract.cohort}</dd></div><div><dt>Scoring Rule</dt><dd>{contract.rules}</dd></div><div><dt>Interpretation</dt><dd>{contract.interpretation}</dd></div></dl>
    </Section>
  </div>;
}
