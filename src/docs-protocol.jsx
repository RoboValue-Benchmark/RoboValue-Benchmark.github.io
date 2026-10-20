import React, { useEffect } from 'react';
import { GROUPS } from './benchmark-metrics';
import { metricDocumentation, dimensionDocumentation, trajectoryTypes } from './docs-metrics';
import { metricPages, metricDimensionPages } from './navigation';
import { Section } from './docs-content';
import { MathExpression } from './docs-math';
import './protocol-tracks.css';
import './docs-metrics.css';

export default function ProtocolContent({ page }) {
  useEffect(() => {
    // Deep links must scroll after this lazily loaded content has mounted.
    const target = document.getElementById(window.location.hash.slice(1));
    if (target?.tagName === 'DETAILS') target.open = true;
    target?.scrollIntoView();
  }, [page.path]);
  switch (page.kind) {
    case 'metrics': return <MetricsReference />;
    case 'metric-dimension': return <MetricDimension dimension={page.dimension} />;
    case 'metric': return <MetricGuide metricKey={page.metricKey} />;
    default: return <EvaluationProtocol />;
  }
}

export function EvaluationProtocol() {
  return <div className="doc-content">
    <p className="doc-lead">The RoboValue team evaluates submitted models under a standardized protocol designed to support fair comparisons and reliable results. This page sets out the evaluation requirements and procedures.</p>
    <Section id="protocol-settings" title="Evaluation Tracks">
      <p>The three tracks differ in access to task-specific demonstrations and have separate leaderboards.</p>
      <div className="doc-protocol-tracks"><div className="doc-protocol-track-grid">
        <article className="doc-protocol-track doc-protocol-track--zero" aria-labelledby="protocol-zero-shot">
          <h3 id="protocol-zero-shot">Zero-Shot</h3>
          <p>Use a released checkpoint without task-specific demonstrations or adaptation.</p>
        </article>
        <article className="doc-protocol-track doc-protocol-track--one" aria-labelledby="protocol-one-shot">
          <h3 id="protocol-one-shot">One-Shot</h3>
          <p>Use one expert demonstration per task for inference-time conditioning or task-specific adaptation.</p>
        </article>
        <article className="doc-protocol-track doc-protocol-track--full" aria-labelledby="protocol-full-shot">
          <h3 id="protocol-full-shot">Full-Shot</h3>
          <p>Train or fine-tune on the complete training set of 100 expert demonstrations per task.</p>
        </article>
      </div></div>
      <p>Published results cover Zero-Shot and One-Shot evaluation. Full-Shot evaluation is planned.</p>
      <p id="dataset-references">For One-Shot, the RoboValue team preselects one expert demonstration from each task's standard-scenario training set. It follows the task's default execution strategy and remains fixed across test trajectories and evaluation conditions. Participants do not need to provide their own references. Private test trajectories are never used as reference demonstrations or adaptation data.</p>
    </Section>
    <Section id="protocol-evaluation" title="Evaluation Procedure">
      <p>The RoboValue team evaluates each model on private test trajectories. We first review the model's adapter to determine which prediction interfaces it supports, including scalar values, pairwise comparisons, and subtask descriptions, and identify the metrics that can be evaluated. For each metric, the benchmark constructs queries using the trajectory observations and task instructions required by that metric. The adapter translates each query into the model's required inputs, including observation frames, temporal context, and reference information when needed. It then invokes either the local model for an open-source submission or the submitted inference service for a closed-source submission. The team computes metric scores from the returned predictions according to the scoring rules for each metric.</p>
      <p>Zero-Shot and Full-Shot follow the same inference workflow, with no reference demonstration supplied during evaluation. Zero-Shot uses the submitted model without task-specific adaptation, whereas Full-Shot uses a model trained or fine-tuned on the released training set. One-Shot uses the fixed reference demonstration described above.</p>
    </Section>
    <Section id="protocol-integrity" title="Evaluation Integrity">
      <p>Training and adaptation must follow the data restrictions of the selected track. Private test trajectories and their ground-truth annotations are neither released as training data nor used as references. Before evaluation, the RoboValue team reviews each adapter to verify that it correctly prepares the model's observation context and reference inputs, preserves native output semantics, and does not introduce scoring annotations into model inputs or prediction logic. The model version and inference configuration, including camera views, preprocessing, prompts, and temporal context, are recorded and kept fixed throughout evaluation.</p>
    </Section>
    <Section id="protocol-results" title="Scoring">
      <p id="protocol-coverage">Metric results are reported separately by track, domain, and evaluation condition. Published TRR and CSVC results cover the standard setting only. For each metric and condition, task scores are averaged within simulation and within the real-world domain. The combined score is the mean of these two averages, giving both domains equal weight.</p>
      <p>The <a href="/leaderboard/">leaderboard</a> combines normalized metric scores into four capability scores, then averages those scores for the overall ranking. Missing or unsupported measurements remain N/A in metric-level results and contribute zero after normalization to the aggregate, without redistributing their weights.</p>
      <details className="doc-scoring-details" id="leaderboard-scoring">
        <summary>Leaderboard Details</summary>
        <p>For metric values displayed ×100, normalize VOC, Memory-VOC, VROC, and CSVC by (x + 100) / 2, and FPL by 100 − x. Other percentage scores remain unchanged.</p>
        <p>For metrics with all three conditions, average the two out-of-domain scores, then average that result with the in-domain score. The effective weights are ½ for Standard and ¼ for each shifted condition. TRR and CSVC use Standard scores. VROC uses an equal average of its reverse-half correlations across all three conditions.</p>
        <div className="doc-table-scroll" role="region" aria-label="Capability score weights" tabIndex={0}><table className="doc-contract-table">
          <thead><tr><th>Capability</th><th>Combination of Normalized Scores</th></tr></thead>
          <tbody>
            <tr data-capability="understanding"><td className="doc-capability">Task-State Understanding</td><td>½ SA + ¼ TGA-CT + ¼ TGA-CF</td></tr>
            <tr data-capability="tracking"><td className="doc-capability">Temporal Progress Monitoring</td><td>¼ VOC + ¼ Memory-VOC + ½ VROC</td></tr>
            <tr data-capability="diagnosis"><td className="doc-capability">Failure and Recovery Reasoning</td><td>½ FPL + ½ TRR</td></tr>
            <tr data-capability="consistency"><td className="doc-capability">Value Consistency</td><td>½ VS + ½ CSVC</td></tr>
          </tbody>
        </table></div>
        <p>SIA is reported separately. Cycle-VOC is not added again because its forward and reverse components are already represented. Overall scores are computed before rounding.</p>
      </details>
    </Section>
  </div>;
}

function MetricCards({ dimension }) {
  return <div className="doc-reading-cards doc-metric-cards" data-capability={dimension}>
    {metricPages.filter(page => page.dimension === dimension).map(page => <a key={page.path} href={page.path}>
      <span className="doc-reading-card-title">{page.title}<span aria-hidden="true">→</span></span>
      <p>{metricDocumentation[page.metricKey].purpose.split('. ')[0]}.</p>
    </a>)}
  </div>;
}

export function MetricsReference() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue evaluates four complementary capabilities through 11 metrics. Explore each dimension to see how its tests relate, then open a metric for its evaluation data, formula, and interpretation.</p>
    {GROUPS.map(group => <Section key={group.id} id={`protocol-${group.id}`} title={group.title} capability={group.id}>
      <p>{dimensionDocumentation[group.id].purpose}</p>
      <MetricCards dimension={group.id} />
      <a className="inline-link" href={metricDimensionPages.find(page => page.dimension === group.id).path}>How these metrics relate →</a>
    </Section>)}
    <Section id="metric-notation" title="Shared Notation">
      <p>A query <MathExpression>A</MathExpression> contains the current observation and any model-specific context. The task instruction is <MathExpression>l</MathExpression>. The three shared interfaces are:</p>
      <dl className="doc-definition-list">
        <div><dt><MathExpression>{'v(A;l)'}</MathExpression></dt><dd>A scalar execution value, oriented so that larger values indicate more favorable assessments.</dd></div>
        <div><dt><MathExpression>{'c(A_1,A_2;l)'}</MathExpression></dt><dd>A signed comparison; a positive value favors the second state. Models without a native comparison use the difference between their scalar values.</dd></div>
        <div><dt><MathExpression>{'s(A;l)'}</MathExpression></dt><dd>A free-form description of the active subtask.</dd></div>
      </dl>
      <p>Along a trajectory, <MathExpression>{'v_i=v(A_{t_i};l)'}</MathExpression> is the value at timestamp <MathExpression>{'t_i'}</MathExpression>. The indicator <MathExpression>{'\\mathbf 1[\\cdot]'}</MathExpression> equals one when its condition holds and zero otherwise. The formulas use raw metric scores; result tables display them multiplied by 100. FPL is an error measure, so lower values are better.</p>
    </Section>
  </div>;
}

export function MetricDimension({ dimension }) {
  const definition = dimensionDocumentation[dimension];
  return <div className="doc-content">
    <p className="doc-lead">{definition.purpose}</p>
    <p>{definition.relationship}</p>
    <MetricCards dimension={dimension} />
    <p className="doc-metric-footer"><a href="/doc/get-started/protocol/metrics/#metric-notation">Shared interfaces and notation</a></p>
  </div>;
}

export function MetricGuide({ metricKey }) {
  const metric = metricDocumentation[metricKey];
  const dimension = metricDimensionPages.find(page => page.children.some(child => child.metricKey === metricKey));
  return <div className="doc-content doc-metric-guide" data-capability={dimension.dimension}>
    <p className="doc-metric-dimension"><a href={dimension.path}>{dimension.title}</a></p>
    <p className="doc-lead"><strong>{metric.name}.</strong> {metric.purpose}</p>
    <dl className="doc-metric-facts">
      <div><dt>Interface</dt><dd>{metric.input}</dd></div>
      <div><dt>Raw Score</dt><dd>{metric.range}</dd></div>
      <div><dt>Direction</dt><dd>{metric.lower ? 'Lower is better' : 'Higher is better'}</dd></div>
    </dl>
    <Section id={`metric-${metricKey}-data`} title="Evaluation Data">
      <ul className="doc-trajectory-types" aria-label="Trajectory types used">{metric.trajectories.map(key => <li key={key}><a href={trajectoryTypes[key].href}>{trajectoryTypes[key].label}</a></li>)}</ul>
      <p>{metric.cohort}</p>
    </Section>
    <Section id={`metric-${metricKey}`} title="Scoring">
      {metric.preparation.map((text, index) => <p key={index}>{text}</p>)}
      <div className="doc-formulas">{metric.formulas.map(({ tex, description }, index) => <figure className="doc-formula" key={index}>
        <MathExpression display>{tex}</MathExpression><figcaption>{description}</figcaption>
      </figure>)}</div>
      {metric.details.map((text, index) => <p key={index}>{text}</p>)}
    </Section>
    <Section id={`metric-${metricKey}-interpretation`} title="Interpretation"><p>{metric.interpretation}</p></Section>
    <p className="doc-metric-footer">Formulas use raw scores; result tables display scores ×100. See <a href="/doc/get-started/protocol/metrics/#metric-notation">shared notation</a> and <a href="/doc/get-started/protocol/evaluation/#protocol-results">score aggregation</a>.</p>
  </div>;
}
