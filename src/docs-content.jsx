import React, { useEffect, useState } from 'react';
import { Figure } from './benchmark';
import { GROUPS, METRICS } from './benchmark-metrics';
import { INSTITUTIONS } from './project-info';
import './docs-content-layout.css';

const AUTHORS = [
  ['Shengbang Liu', '1,2,*', 'https://liushb9.github.io/'],
  ['Zhengye Du', '1,2,*', 'https://duzhengye-droid.github.io/'],
  ['Zhilong Wan', '1,2,*', 'https://loongwz.github.io/'],
  ['Honghao Su', '3,*', 'https://scholar.google.com/citations?user=gAcJUVQAAAAJ'],
  ['Chenxiang Xia', '1', 'https://xcxjasonhsia.github.io/'],
  ['Chang Ge', '4'],
  ['Jinyang Xiao', '4', 'https://xiaojy36.github.io/'],
  ['Nan Wang', '2,†', 'https://bigcileng.github.io/'],
  ['Zhipeng Hu', '1'],
  ['Huining Yuan', '1', 'https://scholar.google.com/citations?user=zmSByPoAAAAJ'],
  ['Shu’ang Yu', '1', 'https://scholar.google.com/citations?user=wb79fkMAAAAJ'],
  ['Yue Chen', '3,5', 'https://yuechen0614.github.io/'],
  ['Tianxing Chen', '3,6', 'https://tianxingchen.github.io/'],
  ['Chuankang Li', '2'],
  ['Maoqing Yao', '2', 'https://openreview.net/profile?id=~Maoqing_Yao1'],
  ['Wenbo Ding', '1,3', 'https://ssr-group.net/'],
  ['Yu Wang', '1', 'https://nicsefc.ee.tsinghua.edu.cn/people/YuWang'],
  ['Guanghui Ren', '2,‡', 'https://sundrops.github.io/'],
  ['Chao Yu', '1,‡', 'https://zoeyuchao.github.io/'],
];

const OVERVIEW_METRICS = [
  ['understanding', [
    ['sa', 'Do terminal values rank successful executions above unsuccessful ones?'],
    ['tga_ct', 'Does the correct instruction yield more value gain than other task instructions?'],
    ['tga_cf', 'Do edits to the required object, action, placement, or constraint reduce value gain?'],
    ['sia', 'Can the model identify the current subtask?'],
  ]],
  ['tracking', [
    ['voc', 'Do values increase along a successful execution?'],
    ['cycle_voc', 'Do values rise in forward replay and fall in reverse replay?'],
    ['memory_voc', 'Do values track accumulated progress when similar visual states recur?'],
  ]],
  ['diagnosis', [
    ['fpl', 'Does the largest value decline align with failure onset?'],
    ['trr', 'Do value trends reflect failure, continued error, recovery attempts, and outcomes?'],
  ]],
  ['consistency', [
    ['vs', 'Do values avoid both spurious fluctuations and prolonged flatness?'],
    ['csvc', 'Does the same subtask receive comparable gains across valid execution orders?'],
  ]],
];



export function EvaluationWorkflow() {
  return <div className="doc-content">
    <p className="doc-lead">Follow the steps to submit your model and receive evaluation results.</p>
    <div className="doc-reading-cards" id="workflow-path">
      <a href="/doc/get-started/adapters/"><span className="doc-reading-card-title">Submission<span aria-hidden="true">→</span></span><p>Open-source and closed-source participation routes, and what to provide.</p></a>
      <a href="/doc/model-api/"><span className="doc-reading-card-title">Adapter Guide<span aria-hidden="true">→</span></span><p>Write an adapter for your inference service.</p></a>
      <a href="/doc/get-started/evaluation/results/"><span className="doc-reading-card-title">Results<span aria-hidden="true">→</span></span><p>Where to find evaluation results and announcements.</p></a>
    </div>
  </div>;
}

export function SubmitModel() {
  return <div className="doc-content">
    <p className="doc-lead">Submit an open-source model or connect a closed-source service for evaluation by the RoboValue team.</p>
    <Section id="submission-participation" title="Participation">
      <dl className="doc-definition-list"><div><dt>Open-Source Models</dt><dd>The RoboValue team handles the adapter, inference setup, and evaluation. You do not need to host an inference service or submit an adapter.</dd></div><div><dt>Closed-Source Models</dt><dd>For integration, provide an inference service and a model-specific adapter. Implement the adapter according to the <a href="/doc/model-api/">Adapter Guide</a> and hand it over to the RoboValue team for review and execution. You do not need to release model weights.</dd></div></dl>
    </Section>
    <Section id="submission-context" title="Model Details">
      <p>For both open-source and closed-source models, you must specify the model or checkpoint version, preprocessing or prompt revision, and evaluation track: Zero-Shot, One-Shot, or Full-Shot (see <a href="/doc/get-started/protocol/evaluation/">Evaluation Protocol</a>). Describe the observations your model requires and its supported prediction methods, including the meaning, units, and direction of its outputs. Keep the model version and inference setup fixed throughout evaluation.</p>
    </Section>
    <Section id="submission-contact" title="Submission">
      <p>For open-source models, simply share links to your inference codebase and checkpoint repository with the RoboValue team. For closed-source models, submit your adapter source code as a pull request to the <a href="https://github.com/RoboValue-Benchmark/RoboValue">main RoboValue repository</a> for our review. Share service access details and credentials privately, not in the pull request.</p>
    </Section>
    <Section id="submission-next" title="Adapter Guide">
      <p>For closed-source models, see the <a href="/doc/model-api/">next page</a> for instructions on writing your adapter.</p>
    </Section>
  </div>;
}

export function EvaluationResults() {
  return <div className="doc-content">
    <p className="doc-lead">Evaluation results will be published on the <a href="/leaderboard/">Leaderboard</a>. New results will also be announced in the News section of the <a href="https://github.com/RoboValue-Benchmark/RoboValue#readme">main repository's README</a> and shared in our <a href="/community/">community groups</a>.</p>
  </div>;
}


export const documentationSections = {
  home: [['about-robovalue', 'Overview'], ['overview-metrics', 'Metrics'], ['explore-documentation', 'Explore']],
  start: [
    ['recommended-path', 'Reading Guide'],
    ['evaluation-responsibilities', 'Responsibilities'],
    ['before-participating', 'Before Participating'],
  ],
  data: [
    ['dataset-splits', 'Training Set'],
    ['dataset-test', 'Test Set'],
    ['dataset-observations', 'Observations'],
    ['dataset-annotation', 'Annotation'],
  ],
  'data-download': [['dataset-training', 'Training Data']],
  submission: [
    ['submission-participation', 'Participation'],
    ['submission-context', 'Model Details'],
    ['submission-contact', 'Submission'],
    ['submission-next', 'Adapter Guide'],
  ],
};

export function Section({ id, title, capability, children }) {
  return <section className={`doc-section${capability ? ' doc-capability-section' : ''}`} data-capability={capability} aria-labelledby={`${id}-title`}>
    <h2 id={id}><span id={`${id}-title`}>{title}</span><a className="doc-heading-anchor" href={`#${id}`} aria-label={`Link to ${title}`}>#</a></h2>
    {children}
  </section>;
}

function PrivateTestNotice() {
  return <aside className="doc-notice" aria-label="Private test-set evaluation">
    <strong>Private Test Set, Organizer-Run Evaluation</strong>
    <p>RoboValue uses a private, held-out test set. The RoboValue team conducts the evaluation. The test set is not publicly released for download or local evaluation.</p>
  </aside>;
}

function TrainingDownloadLink() {
  return <button type="button" disabled title="Hugging Face download link to be added">Training data download · Hugging Face</button>;
}

export function PageOutline({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.[0]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const reached = sections.filter(([id]) => document.getElementById(id)?.getBoundingClientRect().top <= 180);
      setActiveId((reached.at(-1) ?? sections[0])?.[0]);
      setProgress(Math.min(100, Math.round(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [sections]);
  return <aside className="page-outline" aria-label="Page sections">
    <nav aria-label="Page sections">{sections.map(([id, title]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? 'location' : undefined}>{title}</a>)}</nav>
    <div className="reading-progress" aria-label={`Reading progress: ${progress}%`}><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" /><circle className="reading-progress-value" cx="14" cy="14" r="11" pathLength="100" strokeDasharray={`${progress} 100`} /></svg><span>{progress}%</span></div>
  </aside>;
}

export function DocumentationOverview() {
  return <div className="doc-content doc-overview">
    <header className="doc-project-heading">
      <img src="/assets/robovalue-logo.png" alt="RoboValue" width="420" />
      <h1>RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1>
      <div className="doc-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation, url]) => <span key={name}>{url ? <a href={url}>{name}</a> : name}<sup>{affiliation}</sup></span>)}</div>
      <div className="doc-affiliations" aria-label="Participating institutions">{INSTITUTIONS.map(([name, file], index) => <figure key={name}><sup>{index + 1}</sup><img src={`/assets/affiliations/${file}`} alt={name} loading="eager" /></figure>)}</div>
      <p className="doc-author-notes"><span>* Equal contribution</span><span>† Project leader</span><span>‡ Corresponding authors</span></p>
    </header>
    <Section id="about-robovalue" title="Overview">
      <p>Robotic value models assess task execution from visual observations and language instructions. Their feedback supports data selection, policy learning, action planning, and execution monitoring, reducing the need for task-specific reward design. Errors in these judgments can propagate into both robot learning and execution, making systematic evaluation essential.</p>
      <p>Existing evaluations often emphasize task outcomes or correlation with forward progress. Strong results can still conceal unreliable intermediate judgments: values may rise during reverse playback, rebound after a failed recovery, or overlook completed subtasks when similar states recur. These errors can reward unproductive behavior and misguide subsequent actions. Evaluation must therefore examine how value feedback responds to task-relevant events throughout an execution.</p>
      <div id="benchmark-overview"><Figure src="/assets/overview-10-11.svg" alt="RoboValue overview: simulation and real-world tasks, expert and diagnostic trajectories, shared evaluation interfaces, four capability dimensions, and the leaderboard" /></div>
      <p><strong className="doc-brand-name">RoboValue</strong> is a fine-grained sim-and-real benchmark for unified evaluation of robotic value models. <strong className="doc-brand-name">RoboValue-Dataset</strong> provides 3,500 expert training demonstrations and 2,792 annotated test trajectories across <strong>15 simulation and 20 real-world manipulation tasks</strong>. Diagnostic trajectories and instruction variations test responses to task requirements, execution history, failure and recovery, and alternative valid solutions. Separate embodiment and environment shifts assess generalization.</p>
      <p><strong className="doc-brand-name">RoboValue-Benchmark</strong> evaluates four complementary capabilities: {GROUPS.map((group, index) => <React.Fragment key={group.id}>{index === 0 ? '' : index === GROUPS.length - 1 ? ', and ' : ', '}<strong className="doc-capability" data-capability={group.id}>{group.title.toLowerCase()}</strong></React.Fragment>)}. Shared interfaces and model-specific adapters enable comparisons across heterogeneous models while preserving their native value semantics.</p>
      <p><strong className="doc-brand-name">RoboValue-Leaderboard</strong> provides overall rankings and capability profiles for three tracks: Zero-Shot, One-Shot, and Full-Shot. Current results cover the first two; Full-Shot will open with the training-data release. The accompanying analyses reveal limitations in instruction grounding, history awareness, recovery reasoning, and subtask credit, helping guide the development of more reliable value feedback for policy learning, action planning, and execution monitoring.</p>
    </Section>
    <Section id="overview-metrics" title="Metrics">
      <div className="doc-table-scroll" tabIndex={0} role="region" aria-label="Evaluation metrics"><table className="doc-overview-metrics"><thead><tr><th scope="col">Capability</th><th scope="col">Metric</th><th scope="col">Evaluation Focus</th></tr></thead><tbody>{OVERVIEW_METRICS.map(([capabilityId, metrics]) => {
          const group = GROUPS.find(group => group.id === capabilityId);
          return metrics.map(([key, question], index) => <tr key={key} data-capability={group.id}>{index === 0 && <th scope="rowgroup" className="doc-capability" rowSpan={metrics.length}>{group.title}</th>}<th scope="row"><a href={`/doc/get-started/protocol/metrics/${key.replaceAll('_', '-')}/`}>{key === 'sia' ? 'SIA' : METRICS[key].label}</a></th><td>{question}</td></tr>);
        })}</tbody></table></div>
    </Section>
    <Section id="explore-documentation" title="Explore"><div className="doc-link-list">{[["/doc/get-started/", 'Usage'], ["/doc/get-started/data/overview/", 'Dataset Overview'], ["/doc/get-started/data/download/", 'Download'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/diagnostic-trajectories/", 'Diagnostic Trajectories']].map(([path, label]) => <a key={path} href={path}>{label}<span aria-hidden="true">→</span></a>)}</div></Section>
  </div>;
}

export function GetStarted() {
  return <div className="doc-content">
    <p className="doc-lead">Explore the dataset, understand the evaluation, and prepare your model for RoboValue.</p>
    <Section id="recommended-path" title="Reading Guide">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/data/">Dataset</a><p>Explore the training and test sets, trajectory types, and training-data access.</p></li>
        <li><a href="/doc/get-started/protocol/evaluation/">Evaluation Protocol</a><p>Review the three tracks, evaluation conditions, and score aggregation.</p></li>
        <li><a href="/doc/get-started/evaluation/">Evaluation Workflow</a><p>Find the submission requirements and integration steps for your model.</p></li>
        <li><a href="/doc/get-started/protocol/metrics/">Metrics</a><p>Read what each metric measures, its mathematical definition, and how to interpret the result.</p></li>
      </ol>
    </Section>
    <Section id="evaluation-responsibilities" title="Responsibilities">
      <p>Participants provide either an open-source model or a closed-source inference service and adapter. The RoboValue team reviews the integration, supplies the One-Shot demonstrations, runs the private evaluation, and reports the scores.</p>
    </Section>
    <Section id="before-participating" title="Before Participating">
      <p>Complete the form on the <a href="/eval/">Eval page</a> and specify your model version, supported inputs and outputs, and intended track. Zero-Shot and One-Shot evaluations are currently reported; Full-Shot will open with the training-data release.</p>
      <p>Review the <a href="/doc/get-started/protocol/evaluation/#dataset-references">demonstration and adaptation policy</a> before preparing your model.</p>
    </Section>
  </div>;
}

export function DatasetGuide() {
  return <div className="doc-content">
    <p className="doc-lead">Explore RoboValue's training and test sets and learn how to access the training data.</p>
    <div className="doc-reading-cards">
      <a href="/doc/get-started/data/overview/"><span className="doc-reading-card-title">Overview<span aria-hidden="true">→</span></span><p>Training demonstrations, evaluation trajectories, and diagnostic coverage.</p></a>
      <a href="/doc/get-started/data/download/"><span className="doc-reading-card-title">Download<span aria-hidden="true">→</span></span><p>Training-data access for model preparation.</p></a>
    </div>
  </div>;
}

export function DatasetOverview() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue covers 15 <strong>Simulation</strong> tasks and 20 <strong>Real-World</strong> tasks, combining expert demonstrations with diagnostic executions.</p>
    <p id="dataset-conditions">The <strong>Standard</strong> setting uses each task's default robot and environment for in-domain (ID) evaluation. Two out-of-domain (OOD) settings introduce separate shifts: <strong>Cross-Embodiment</strong> changes the robot platform, and <strong>Cross-Environment</strong> changes the visual environment while retaining the standard robot.</p>
    <Section id="dataset-splits" title="Training Set">
      <p>The training set contains 3,500 expert demonstrations, with 100 per task, all collected under the standard setting. For tasks with multiple valid solutions, it also provides executions in different valid subtask orders.</p>
      <p>The One-Shot track uses one demonstration per task from this set. The Full-Shot track will allow training or fine-tuning on the complete set. Training demonstrations do not include subtask boundary annotations.</p>
      <p>See <a href="/doc/get-started/data/download/">Download</a> for training data access.</p>
    </Section>
    <Section id="dataset-test" title="Test Set">
      <PrivateTestNotice />
      <p>The test set contains 2,792 annotated trajectories, disjoint from the training set. It covers expert demonstrations, failure and recovery trajectories, long-horizon temporal trajectories, and multi-solution trajectories across the evaluation settings. Coverage depends on the task and metric; <a href="/doc/diagnostic-trajectories/">Diagnostic Trajectories</a> illustrates the execution patterns.</p>
      <p>Task instructions, subtasks, and visual examples are listed under <a href="/doc/simulation-tasks/">Simulation Tasks</a> and <a href="/doc/real-world-tasks/">Real-World Tasks</a>.</p>
    </Section>

    <Section id="dataset-observations" title="Observations">
      <p><strong>Visual observations.</strong> Each trajectory records synchronized RGB-D observations from three cameras: one head-mounted camera and one camera on each wrist.</p>
      <p><strong>Robot states and actions.</strong> Recordings include robot joint positions, end-effector poses, and gripper states, together with action targets. The field layout depends on the simulation or real-world platform; end-effector poses describe the position and orientation of each arm's end effector.</p>
    </Section>
    <Section id="dataset-annotation" title="Annotation">
      <p>The following annotations are provided for test-set evaluation and are not supplied as model inputs.</p>
      <p><strong>Subtask boundaries.</strong> For successful trajectories, including <a href="/doc/diagnostic-trajectories/multi-solution/">multi-solution trajectories</a>, we annotate the start and end of each subtask. These annotations provide ground truth for identifying the active subtask in <a href="/doc/get-started/protocol/metrics/sia/">SIA</a> and define the boundaries used to compare subtask value gains across valid solutions in <a href="/doc/get-started/protocol/metrics/csvc/">CSVC</a>.</p>
      <p><strong>Failure stages.</strong> For <a href="/doc/diagnostic-trajectories/failure-and-recovery/">failure and recovery trajectories</a>, we annotate the start and end of the initial failure stage, along with the endpoint of the subtask in which the failure occurs. These timestamps provide ground truth for failure localization in <a href="/doc/get-started/protocol/metrics/fpl/">FPL</a> and define the failure and continued-error intervals evaluated by <a href="/doc/get-started/protocol/metrics/trr/">TRR</a>.</p>
      <p><strong>Recovery outcomes.</strong> For <a href="/doc/diagnostic-trajectories/failure-and-recovery/">Effective Recovery and Ineffective Recovery trajectories</a>, we also annotate when the recovery outcome becomes observable. This timestamp separates the recovery attempt from its outcome, allowing <a href="/doc/get-started/protocol/metrics/trr/">TRR</a> to assess whether value trends distinguish a recovery attempt from its success or failure.</p>
    </Section>
  </div>;
}

export function DatasetDownload() {
  return <div className="doc-content">
    <p className="doc-lead">The training set will be released on Hugging Face. The private test set is reserved for organizer-run evaluation.</p>
    <Section id="dataset-training" title="Training Data">
      <p>The training set contains 3,500 expert demonstrations: 100 for each of the 15 simulation and 20 real-world tasks, collected under the standard in-domain (ID) setting.</p>
      <p>These demonstrations support the One-Shot and Full-Shot tracks. They do not include subtask boundary annotations.</p>
      <div className="doc-download-panel"><div><strong>Training data on Hugging Face</strong><p>The download link will be added here when available.</p></div><TrainingDownloadLink /></div>
    </Section>

  </div>;
}
