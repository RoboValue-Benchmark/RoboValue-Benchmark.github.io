import React, { useState } from 'react';
import { Icon } from './benchmark';
import { NextSteps, Section } from './docs-content';

const codeRoot = 'https://github.com/RoboValue-Benchmark/RoboValue/blob/main';
const syntheticImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNocFAAAAIkAOGrWWInAAAAAElFTkSuQmCC';
const identity = {
  protocol: 'robovalue-inference-v2',
  model_id: 'mock-value',
  model_version: '1',
  preprocessing_version: 'mock-rgb-v1',
  shot_mode: 'zero_shot',
};
const requestId = '9d38c39a-85f3-4a4a-943a-249ce3f91cdf';
const exampleRequest = {
  ...identity,
  items: [{
    request_id: requestId,
    op: 'value',
    instruction: 'Move the cup',
    contexts: [{ frames: [{ front: syntheticImage }] }],
  }],
};
const exampleResponse = {
  ...identity,
  results: [{ request_id: requestId, op: 'value', score: 128 }],
};
const exampleConfig = `backend: remote_api
model: mock-value
batch_size: 2
data: /path/to/private/test-set
output: /path/to/evaluation-output
metrics:
  sa:
    mode: base
    domains: [id]
tasks: [organize_table]
api:
  url: http://127.0.0.1:8765/inference
  allow_local_http: true
  model_version: "1"
  preprocessing_version: mock-rgb-v1
  capabilities: [value, compare, subtask]
  compare_mode: native
  shot_mode: zero_shot
  input_profile:
    name: current_frame_v1
    views: [front]`;

export const apiSections = [
  ['api-overview', 'Integration at a glance'],
  ['api-operations', 'Supported operations'],
  ['api-configuration', 'Organizer configuration'],
  ['api-wire', 'Request and response'],
  ['api-inputs', 'Views and history'],
  ['api-references', 'Model-side preparation'],
  ['api-reliability', 'Security and replay'],
  ['api-mock', 'Try the CPU mock'],
];

function CodeBlock({ title, language, code }) {
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
    <div className="doc-code-header"><span>{title}<small>{language}</small></span><button onClick={copy} aria-label={`Copy ${title}`}><Icon name="copy" size={14} /><span aria-live="polite">{copyState}</span></button></div>
    <pre tabIndex={0} aria-label={title}><code>{code}</code></pre>
  </div>;
}

export function ModelAPI() {
  const [wireTab, setWireTab] = useState('request');
  return <div className="doc-content">
    <div className="doc-api-intro">
      <div className="doc-eyebrow"><span className="doc-status-dot" /> Implemented contract · v2</div>
      <p className="doc-lead">Your model returns predictions. RoboValue plans the queries, keeps the test annotations private, and computes the benchmark metrics.</p>
      <div className="doc-tag-row"><span>HTTP POST</span><span>JSON</span><span>RGB inputs</span><span>Inference only</span></div>
    </div>
    <Section id="api-overview" title="One service. Explicit capabilities.">
      <p>Provide a model API and agree on model identity, preprocessing, input context, evaluation setting, and native output semantics. The endpoint path is configurable. This is an inference contract, not a submission platform or an endpoint that returns benchmark scores.</p>
      <aside className="doc-note"><strong>Private test set does not mean invisible observations.</strong><p>An external service receives the images and instructions needed for inference. If observations must not leave the organizer environment, deploy the service within that environment.</p></aside>
      <p>See the <a href={`${codeRoot}/docs/api.md`}>repository specification</a> for the complete contract and <a href="/doc/get-started/adapters/">Submit a Model</a> for the participation checklist.</p>
    </Section>
    <Section id="api-operations" title="Implement the operations your model supports">
      <div className="doc-table-scroll" role="region" aria-label="API operation contract" tabIndex={0}>
        <table className="doc-contract-table"><thead><tr><th>Operation</th><th>Observation context</th><th>Return</th></tr></thead><tbody>
          <tr><td><code>value</code></td><td>One ordered context</td><td>Finite numeric <code>score</code></td></tr>
          <tr><td><code>compare</code></td><td>Two contexts: a, then b</td><td>Finite numeric <code>score</code>; positive favors b</td></tr>
          <tr><td><code>subtask</code></td><td>One ordered context</td><td>Nonempty textual <code>output</code></td></tr>
        </tbody></table>
      </div>
      <p><code>value</code> supports SA/SD, VOC, Memory-VOC, Cycle-VOC, FPL, TRR, and VS. TGA and CSVC use native <code>compare</code> or explicit <code>value_difference</code>. SIA uses <code>subtask</code>; the organizer’s judge obtains ground-truth candidate probabilities.</p>
      <p>Declare only operations the service implements. Unsupported configured metrics fail before evaluation; missing reported coverage is N/A, not zero. Only <code>mode: base</code> is supported.</p>
    </Section>
    <Section id="api-configuration" title="Select the backend in the organizer runner">
      <p>Set <code>backend: remote_api</code> in a normal evaluation configuration. The <code>model</code> field is your model identity, not a local adapter family. No local <code>python</code>, <code>checkpoint</code>, or <code>gpu</code> field is required.</p>
      <CodeBlock title="Organizer configuration · synthetic mock" language="YAML" code={exampleConfig} />
      <p>This is the <a href={`${codeRoot}/configs/remote_api.example.yaml`}>published mock configuration</a>. Dataset and output paths belong to the organizer. For a real service, use HTTPS, remove <code>allow_local_http</code>, and replace identity, capabilities, and input settings. If authentication is required, <code>api.token_env</code> names the credential environment variable; never place its value in YAML.</p>
    </Section>
    <Section id="api-wire" title="A self-contained request and a matched result">
      <p>Each request carries the protocol, frozen model/preprocessing identity, <code>shot_mode</code>, and an <code>items</code> batch. Each item contains only an opaque <code>request_id</code>, operation, instruction, and observation contexts.</p>
      <div className="doc-wire-tabs" role="tablist" aria-label="Wire example">
        {['request', 'response'].map(tab => <button key={tab} id={`wire-${tab}-tab`} role="tab" aria-selected={wireTab === tab} aria-controls="wire-example" tabIndex={wireTab === tab ? 0 : -1} onClick={() => setWireTab(tab)} onKeyDown={event => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const next = event.key === 'Home' ? 'request' : event.key === 'End' ? 'response' : wireTab === 'request' ? 'response' : 'request';
            setWireTab(next);
            document.getElementById(`wire-${next}-tab`).focus();
          }
        }}>{tab === 'request' ? 'Request' : 'Response'}</button>)}
      </div>
      <div id="wire-example" role="tabpanel" aria-labelledby={`wire-${wireTab}-tab`}>
        <CodeBlock key={wireTab} title={wireTab === 'request' ? 'Request body' : 'Response body'} language="JSON" code={JSON.stringify(wireTab === 'request' ? exampleRequest : exampleResponse, null, 2)} />
      </div>
      <p className="doc-example-caption">A real Base64-encoded 1 × 1 synthetic RGB PNG, not a test observation. The CPU mock returns its red-channel value, 128. This is a transport example, not a model-performance result.</p>
      <p>Echo <code>protocol</code>, <code>model_id</code>, <code>model_version</code>, <code>preprocessing_version</code>, and <code>shot_mode</code>. Return exactly one result per ID. Order may differ; the client restores query order using IDs. Extra, missing, duplicate, or mismatched results fail explicitly.</p>
      <p>Preserve agreed Adapter units and direction. A documented conversion, such as negating native remaining time, belongs in the frozen service wrapper. Do not impose common min–max normalization. <code>value_difference</code> computes <code>V(b) − V(a)</code> client-side; it is never an automatic fallback.</p>
    </Section>
    <Section id="api-inputs" title="Agree on views, sampling, and execution history">
      <p>Each context contains ordered <code>frames</code>. Each frame maps declared camera names to lossless Base64 PNG images, without a data-URL prefix. Preserve ordering, repeated frames, and padding.</p>
      <p>The input profile explicitly selects views and a versioned rule: <code>current_frame_v1</code>, <code>full_prefix_v1</code>, <code>robometer_prefix_v1</code>, <code>rynnvalue_prefix_v1</code>, or <code>procvlm_window_v1</code>, with its required parameters. There is no default sampler; see the <a href={`${codeRoot}/docs/api.md#observation-profiles`}>profile table</a>.</p>
      <p>Every query includes its required context. Do not rely on memory from previous requests. Memory-VOC retains history; Cycle-VOC uses continuous forward/reverse history with a shared turn, not an independently reset reverse video.</p>
      <p>The wire protocol does not carry training references, depth, robot states, actions, scoring timestamps, or streaming sessions. Internal query IDs, file paths, success labels, SIA targets, and TRR stage/branch labels remain organizer-local.</p>
    </Section>
    <Section id="api-references" title="Prepare references before inference">
      <p>One-Shot / Few-Shot references are prepared by the provider on the service side. Agree on the demonstration count and selected training assets before evaluation. The client does not read, sample, upload, or adapt to reference videos.</p>
      <p>The current v2 client accepts <code>shot_mode: zero_shot</code> or <code>one_shot</code>. One-Shot still uses <code>one_shot</code> even though no reference is sent. A Few-Shot run must not be relabeled One-Shot; coordinate its wire-protocol support and run recording with the organizers before API evaluation.</p>
      <p>Confirm assets and the allowed demonstration count through the <a href="/doc/get-started/data/#dataset-references">training-reference agreement</a>. Freeze selection and preparation. Change <code>preprocessing_version</code> when preparation changes, or <code>model_version</code> when parameters change. Never use test trajectories as references.</p>
    </Section>
    <Section id="api-reliability" title="Keep transport secure and replay stable">
      <dl className="doc-definition-list"><div><dt>HTTPS and private credentials</dt><dd>Certificate verification stays enabled; redirects are not followed. HTTP is allowed only for explicit loopback mocks. Bearer credentials are read from the named environment variable.</dd></div><div><dt>Stable retry IDs</dt><dd>The same ID with identical inputs must return the same prediction within a run. Reject reuse with different inputs. Requests are serial: default 120-second timeout, at most three attempts for connection failures, timeouts, HTTP 429, or temporary 500/502/503/504 responses.</dd></div><div><dt>Strict failures, not substitute scores</dt><dd>Scores must be finite numbers, not booleans; text must be nonempty. Responses are limited to 8 MiB. Invalid outputs fail, preserving completed records instead of fabricating zeros or N/A.</dd></div></dl>
    </Section>
    <Section id="api-mock" title="Try the CPU mock without test data">
      <p>From a checkout with existing compatible dependencies, run the loopback-only synthetic service:</p>
      <CodeBlock title="Start the synthetic service · POSIX shell" language="Shell" code="PYTHONPATH=src python -m vmbmk.tools.mock_api --port 8765" />
      <p>POST the request above to <code>http://127.0.0.1:8765/inference</code>. The mock supports all three operations and returns results in reverse order to exercise ID matching. Use synthetic inputs only.</p>
      <div className="doc-resource-row"><a href={`${codeRoot}/src/vmbmk/tools/mock_api.py`}>Mock service ↗</a><a href={`${codeRoot}/tests/adapters/test_remote_api.py`}>Contract tests ↗</a><a href={`${codeRoot}/docs/api.md#service-wrapper-and-synthetic-check`}>Service wrapping guide ↗</a></div>
    </Section>
    <NextSteps links={[["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/get-started/data/", 'Dataset Overview'], ["/community/", 'Discuss integration']]} />
  </div>;
}
