import React, { useState } from 'react';
import { Icon } from './benchmark';
import { Section } from './docs-content';

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
  ['adapter-service', 'Service'],
  ['adapter-interfaces', 'Interface'],
  ['adapter-example', 'Examples'],
  ['adapter-handoff', 'Handoff'],
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
    <p className="doc-lead">If you choose close-source method to participate, you will need an adapter to convert the queries into model's input and to translate its output into specified interface. The document below will guide you how to do this. </p>
    <Section id="adapter-service" title="Service">
      <p>If you prefer to keep your inference code and model weights private, run the model on your own infrastructure and provide an inference endpoint that the RoboValue team can call. The service can keep its native request and response format; the adapter converts RoboValue queries into service requests and maps the responses to the adapter interface.</p>
    </Section>
    <Section id="adapter-interfaces" title="Interface">
      <p>You need to make sure your adapter prepares inputs in the same way as your model's usual inference pipeline does, including any required observation history or reference inputs. The adapter should then send these inputs to your inference service.</p>
      <div className="doc-table-scroll" role="region" aria-label="Benchmark adapter interfaces" tabIndex={0}>
        <table className="doc-contract-table"><thead><tr><th>Method</th><th>Input per Query</th><th>Native Prediction</th></tr></thead><tbody>
          <tr><td><code>value</code></td><td>One observation sequence and task instruction</td><td>A finite scalar score in the model’s native units.</td></tr>
          <tr><td><code>compare</code></td><td>Two observation sequences, ordered A1 then A2, and a task instruction</td><td>A finite comparison score with direction</td></tr>
          <tr><td><code>subtask</code></td><td>One observation sequence and task instruction</td><td>A nonempty predicted subtask description. The RoboValue team’s judge scores it.</td></tr>
        </tbody></table>
      </div>
      <p>Implement only the methods your model supports. Each method accepts a batch of queries and must return one prediction per query in the same order.</p>
      <p>Your adapter should preserve your model's native output semantics, including its units and score direction. For example, use <code>compare_value_difference</code> to compute <code>V(b) − V(a)</code> only when this difference matches your model's comparison semantics. If the model has its own pairwise predictor, return its native score instead.</p>
    </Section>
    <Section id="adapter-example" title="Examples">
      <h3>Mock Adapter</h3>
      <p>Start from the <a href={`${sourceRoot}/src/vmbmk/adapters/mock_service.py`}>Mock Adapter</a> and follow the <a href={`${sourceRoot}/src/vmbmk/adapters/base.py`}>adapter interface</a>. The mock uses CPU-only toy predictions; it contains no inference-service URL, API key, or network call.</p>
      <p>To connect your own service, adapt <code>_frames</code> to prepare the observations your model needs, then replace <code>_predict_value</code> and <code>_predict_subtask</code> with calls to your inference service.</p>
      <CodeBlock title="Prepare Context" code={contextExample} />
      <CodeBlock title="Return Predictions" code={predictionExample} />
      <h3>Reference Adapters</h3>
      <p>These adapters show how two real models handle different input requirements. Both run inference locally; for a hosted model, keep the input preparation and output mapping and replace the model call with a service request.</p>
      <dl className="doc-definition-list">
        <div><dt><a href={`${sourceRoot}/src/vmbmk/adapters/robometer.py`}>RoboMeter</a></dt><dd>Shows observation-history preparation and scalar progress predictions without a reference demonstration. Its <code>compare</code> method uses value differences.</dd></div>
        <div><dt><a href={`${sourceRoot}/src/vmbmk/adapters/robodopamine.py`}>Robo-Dopamine</a></dt><dd>Shows how to prepare the supplied <a href="/doc/get-started/protocol/evaluation/#dataset-references">One-Shot reference</a> from <code>reference_data</code> and use native comparisons to build scalar progress predictions.</dd></div>
      </dl>
    </Section>
    <Section id="adapter-handoff" title="Handoff">
      <p>Include the adapter dependencies, native service input/output specification, and a runnable synthetic example. The <a href={`${sourceRoot}/tests/adapters/test_mock_service.py`}>mock tests</a> show how to check ordered outputs without private test observations. Follow <a href="/doc/get-started/adapters/#submission-contact">Submission</a> to submit your adapter for review.</p>
    </Section>
  </div>;
}
