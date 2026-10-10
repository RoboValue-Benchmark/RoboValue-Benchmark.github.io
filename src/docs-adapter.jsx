import React, { useState } from 'react';
import { Icon } from './benchmark';
import { NextSteps, Section } from './docs-content';

const sourceRoot = 'https://github.com/RoboValue-Benchmark/RoboValue/blob/e7daf61962fea3a4270be0c0fa443d0778052ea1';
const contextExample = `    def _frames(self, query: ValueQuery | SubtaskQuery) -> list[Image.Image]:
        playback = query_view(self.dataset, query, self.view)
        anchor = playback.timeline_anchor(query.state.anchor_frame)
        return playback.read_many(range(anchor + 1))`;
const predictionExample = `    def value(self, queries: Sequence[ValueQuery]) -> list[float]:
        return [
            self._predict_value(self._frames(query), query.instruction)
            for query in queries
        ]

    def compare(self, queries: Sequence[CompareQuery]) -> list[float]:
        return compare_value_difference(queries, self.value)`;

export const adapterSections = [
  ['adapter-service', 'Provide your service'],
  ['adapter-interfaces', 'Implement your adapter'],
  ['adapter-example', 'Adapter examples'],
  ['adapter-handoff', 'Handoff checklist'],
  ['adapter-access', 'Test observations and security'],
];

const pythonTokens = /(?<comment>#[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<keyword>\b(?:class|def|from|import|return|for|in|if|else|True|False|None)\b)|(?<type>\b(?:ValueQuery|CompareQuery|SubtaskQuery|Sequence|Image|list|float|str)\b)|(?<function>\b[a-zA-Z_]\w*(?=\())|(?<number>\b\d+(?:\.\d+)?\b)|(?<punctuation>[()[\]{}:.,])/g;

function highlightedPython(code) {
  const tokens = [];
  let offset = 0;
  for (const match of code.matchAll(pythonTokens)) {
    tokens.push(code.slice(offset, match.index));
    const [type, text] = Object.entries(match.groups).find(([, value]) => value !== undefined);
    tokens.push(<span className={`doc-token-${type}`} key={match.index}>{text}</span>);
    offset = match.index + match[0].length;
  }
  tokens.push(code.slice(offset));
  return tokens;
}

function CodeBlock({ title, code }) {
  const [copyState, setCopyState] = useState('Copy');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('Copied');
    } catch {
      setCopyState('Copy unavailable');
    }
  };
  return <div className="doc-code-block">
    <div className="doc-code-header"><span>{title}<small>Python</small></span><button onClick={copy} aria-label={`Copy ${title}`}><Icon name="copy" size={14} /><span aria-live="polite">{copyState}</span></button></div>
    <pre tabIndex={0} aria-label={title}><code className="language-python">{highlightedPython(code)}</code></pre>
  </div>;
}

export function ServiceAdapter() {
  return <div className="doc-content">
    <div className="doc-integration-intro">
      <div className="doc-eyebrow"><span className="doc-status-dot" /> Closed-source model integration</div>
      <p className="doc-lead">This step is for closed-source models: connect your inference service through an adapter and hand over the integration for review. Your model weights do not need to be released.</p>
      <p>Open-source providers can skip this step; the RoboValue team handles integration. See <a href="/doc/get-started/adapters/#submission-participation">Submit a Model</a> for the submission routes.</p>
      <div className="doc-tag-row"><span>Native service</span><span>Model-specific adapter</span><span>Organizer-run evaluation</span></div>
    </div>
    <Section id="adapter-service" title="1. Provide your inference service">
      <p>Keep your model running in its own environment and provide a reachable inference endpoint. Your service can retain its native request and response format; no RoboValue-specific HTTP payload is required.</p>
      <p>Describe the endpoint, supported predictions, model and preprocessing versions, and authentication requirements. The model may run on a separate machine; the adapter connects that service to the benchmark.</p>
    </Section>
    <Section id="adapter-interfaces" title="2. Implement your model-specific adapter">
      <p>Your adapter selects camera views and frames, preserves the required history, applies padding and preprocessing, calls the service, and converts its outputs. Use your model’s own input policy; RoboValue does not prescribe a shared sampling policy for all models.</p>
      <div className="doc-table-scroll" role="region" aria-label="Benchmark adapter interfaces" tabIndex={0}>
        <table className="doc-contract-table"><thead><tr><th>Method</th><th>Input per query</th><th>Native prediction</th></tr></thead><tbody>
          <tr><td><code>value</code></td><td>One observation sequence and task instruction</td><td>A finite scalar in the model’s native units.</td></tr>
          <tr><td><code>compare</code></td><td>Two observation sequences, ordered A then B, and a task instruction</td><td>A finite comparison score with documented direction.</td></tr>
          <tr><td><code>subtask</code></td><td>One observation sequence and task instruction</td><td>A nonempty predicted subtask description.</td></tr>
        </tbody></table>
      </div>
      <p>Each method accepts a batch of queries and returns one prediction per query in the same order. Implement only the methods your model supports, preserving native units and score direction. Use the existing <code>V(b) − V(a)</code> helper only if that difference matches your model’s comparison semantics; otherwise implement its native comparison. The RoboValue team’s judge scores subtask descriptions.</p>
      <p>Keep the history your model needs. Memory-dependent inputs retain the necessary prefix; Cycle-VOC uses a continuous forward/backward timeline with a shared turn, not a freshly reset reverse segment.</p>
    </Section>
    <Section id="adapter-example" title="3. Start from an existing adapter">
      <p>Read the <a href={`${sourceRoot}/src/vmbmk/adapters/base.py`}>adapter interface</a>, then choose an example that matches your model.</p>
      <dl className="doc-definition-list">
        <div><dt><a href={`${sourceRoot}/src/vmbmk/adapters/mock_service.py`}>CPU mock adapter</a></dt><dd>A minimal example of input preparation and ordered batch outputs. Replace its toy prediction functions with calls to your service.</dd></div>
        <div><dt><a href={`${sourceRoot}/src/vmbmk/adapters/robometer.py`}>RoboMeter · no reference</a></dt><dd>Shows observation-prefix preparation, scalar progress predictions in <code>value</code>, and value-difference comparisons in <code>compare</code>. It does not use a reference demonstration.</dd></div>
        <div><dt><a href={`${sourceRoot}/src/vmbmk/adapters/robodopamine.py`}>Robo-Dopamine · One-Shot reference</a></dt><dd>Shows how <code>_reference</code> reads the reference from <code>reference_data</code> on the evaluation side, uses its start/end frames in native comparisons, and accumulates relative progress into scalar values.</dd></div>
      </dl>
      <p>RoboMeter and Robo-Dopamine run models locally in these implementations. For a hosted service, keep the relevant input preparation and output mapping, and replace model inference with your service call.</p>
      <CodeBlock title="Prepare native context · MockServiceAdapter" code={contextExample} />
      <CodeBlock title="Return native predictions · MockServiceAdapter" code={predictionExample} />
      <p className="doc-example-caption">The mock prepares a complete RGB prefix and predicts locally with toy functions. It is not an HTTP server, a real model, or a reference-conditioned baseline. For your integration, use your model’s native input policy and replace the prediction functions with calls to your service.</p>
      <dl className="doc-definition-list">
        <div><dt>Adapt <code>_frames</code></dt><dd>Replace the example’s complete-prefix policy with your model’s camera selection, history, sampling, and preprocessing rules.</dd></div>
        <div><dt>Replace the prediction functions</dt><dd>Replace <code>_predict_value</code> and <code>_predict_subtask</code> with your native service calls and validate their responses. The mock contains no inference-service URL, API key, or network call.</dd></div>
        <div><dt>Keep the correct comparison</dt><dd>Reuse <code>compare_value_difference</code> only when it matches your scalar-value convention; otherwise implement the model’s native comparison.</dd></div>
      </dl>
      <p>Use the published <a href={`${sourceRoot}/tests/adapters/test_mock_service.py`}>synthetic mock tests</a> as a reference when checking the adapter. The source links point to benchmark code, not an inference endpoint.</p>
    </Section>
    <Section id="adapter-handoff" title="4. Hand over the integration">
      <ul>
        <li><strong>Adapter source:</strong> the model-specific implementation, supported methods, and native output units and direction.</li>
        <li><strong>Service description:</strong> the endpoint, native input/output specification, model and preprocessing versions, and authentication instructions without secret values.</li>
        <li><strong>Model preparation:</strong> adapter dependencies and input preprocessing; One-Shot reference handling or Full-Shot training setup, where applicable.</li>
        <li><strong>A synthetic check:</strong> an example that exercises the integration without private test observations.</li>
      </ul>
      <p>The RoboValue team reviews the adapter before evaluation. Return model predictions, not benchmark scores, and report service failures as errors rather than zero predictions or N/A.</p>
    </Section>
    <Section id="adapter-access" title="5. Protect evaluation observations">
      <p>Follow the reference and fine-tuning policy in <a href="/doc/get-started/data/#dataset-references">Dataset Overview &amp; Download</a>. The model-specific adapter prepares any required One-Shot reference inputs on the evaluation side.</p>
      <p>The test set is not publicly released for download or local evaluation. An external service will receive the observations and instructions needed for inference. Keep file paths, internal query IDs, test labels, and ground-truth candidate identities out of service requests. If observations cannot leave organizer-controlled systems, the service must run there.</p>
      <p>Use HTTPS with certificate verification. Share credentials privately and read them from environment variables, never source code or public configuration. Keep the agreed model and preprocessing versions fixed during evaluation.</p>
    </Section>
    <NextSteps links={[["/doc/get-started/evaluation/results/", 'Next: Evaluation & Results'], ["/doc/get-started/evaluation/", 'Evaluation Workflow']]} />
  </div>;
}
