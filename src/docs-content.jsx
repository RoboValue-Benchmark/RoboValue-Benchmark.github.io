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
    <p className="doc-lead">This page guides you on how to inform the Robovalue team of your preferred participation format for our evaluations and what information you need to provide to us.</p>
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
  home: [['about-robovalue', 'Get Known about RoboValue'], ['benchmark-overview', 'Overview'], ['overview-metrics', 'Metrics'], ['explore-documentation', 'Explore']],
  start: [
    ['recommended-path', 'Reading Guide'],
    ['evaluation-responsibilities', 'Responsibilities'],
    ['before-participating', 'Before Participating'],
  ],
  data: [
    ['dataset-splits', 'Training Trajectories'],
    ['dataset-test', 'Evaluation Trajectories'],
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

export function Section({ id, title, children }) {
  return <section className="doc-section" aria-labelledby={`${id}-title`}>
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
      <div className="doc-affiliations" aria-label="Participating institutions">{INSTITUTIONS.map(([name, file], index) => <figure key={name}><sup>{index + 1}</sup><img src={`/assets/affiliations/${file}`} alt={name} loading="eager" /></figure>)}</div>
      <h1>RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1>
      <div className="doc-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation]) => <span key={name}>{name}<sup>{affiliation}</sup></span>)}</div>
      <p className="doc-author-notes"><span>* Equal contribution</span><span>† Project leader</span><span>‡ Corresponding authors</span></p>
    </header>
    <Section id="about-robovalue" title="Get Known about RoboValue">
      <p>General-purpose robotic value models assess task execution from visual observations and task instructions, providing feedback for policy learning, planning, and execution monitoring. Their errors can influence which behaviors are selected, reinforced, or corrected. However, strong outcome discrimination or forward-progress correlation can still conceal errors in intermediate value judgments, while differences in model interfaces and value semantics hinder consistent diagnosis across models.</p>
      <p><strong>RoboValue is a fine-grained sim-and-real benchmark for unified evaluation of robotic value models.</strong> Its central principle is that value feedback should accurately reflect how well task requirements are being fulfilled throughout execution. RoboValue evaluates four complementary capability dimensions: {GROUPS.map((group, index) => <React.Fragment key={group.id}>{index === 0 ? '' : index === GROUPS.length - 1 ? ', and ' : ', '}<strong className="doc-capability" style={{ '--capability-color': group.color }}>{group.title}</strong></React.Fragment>)}.</p>
      <p><strong>RoboValue-Dataset</strong> combines expert training demonstrations with annotated test trajectories from simulation and real-world manipulation. Diagnostic trajectories and instruction variations probe task grounding, history-dependent progress, recovery outcomes, and consistent subtask credit across valid solutions. These contrasts expose limitations that final outcomes and forward-progress scores alone can overlook.</p>
      <p><strong>RoboValue-Benchmark</strong> uses shared interfaces and model-specific adapters to compare heterogeneous models while preserving their native value semantics. Evaluation separates standard conditions from shifts in robot embodiment and environment. <strong>RoboValue-Leaderboard</strong> presents overall rankings and capability profiles, supporting continued assessment of the reliability of value feedback.</p>
    </Section>
    <Section id="benchmark-overview" title="Benchmark Overview"><Figure src="/assets/overview-10-09.webp" alt="RoboValue overview: sim-and-real data, shared model interfaces, and four complementary evaluation capabilities" /></Section>
    <Section id="overview-metrics" title="Metrics">
      <div className="doc-table-scroll" tabIndex={0} role="region" aria-label="Evaluation metrics"><table className="doc-overview-metrics"><thead><tr><th scope="col">Capability</th><th scope="col">Metric</th><th scope="col">Evaluation Focus</th></tr></thead><tbody>{OVERVIEW_METRICS.map(([capabilityId, metrics]) => {
          const group = GROUPS.find(group => group.id === capabilityId);
          return metrics.map(([key, question], index) => <tr key={key} style={{ '--capability-color': group.color }}>{index === 0 && <th scope="rowgroup" className="doc-capability" rowSpan={metrics.length}>{group.title}</th>}<th scope="row"><a href={`/doc/get-started/protocol/metrics/${key.replaceAll('_', '-')}/`}>{key === 'sia' ? 'SIA' : METRICS[key].label}</a></th><td>{question}</td></tr>);
        })}</tbody></table></div>
      <p className="doc-metric-note">Read these tests together. Cycle-VOC probes elapsed-time shortcuts in VOC and Memory-VOC; VS and CSVC assess consistency, not the correctness of progress direction.</p>
    </Section>
    <Section id="explore-documentation" title="Explore"><div className="doc-link-list">{[["/doc/get-started/", 'Usage'], ["/doc/get-started/data/overview/", 'Dataset Overview'], ["/doc/get-started/data/download/", 'Download'], ["/doc/get-started/evaluation/", 'Evaluation Workflow'], ["/doc/diagnostic-trajectories/", 'Diagnostic Trajectories']].map(([path, label]) => <a key={path} href={path}>{label}<span aria-hidden="true">→</span></a>)}</div></Section>
  </div>;
}

export function GetStarted() {
  return <div className="doc-content">
    <p className="doc-lead">This quick start will help you understand what you can know about RoboValue.</p>
    <Section id="recommended-path" title="Reading Guide">
      <ol className="doc-reading-path">
        <li><a href="/doc/get-started/data/">Dataset</a><p>Gain a preliminary understanding of the training and evaluation trajectories, and learn how to download training data.</p></li>
        <li><a href="/doc/get-started/protocol/evaluation/">Evaluation Protocol</a><p>Get a brief overview of how we structure the evaluation, how models from different tracks participate, and how to ensure the credibility of evaluation.</p></li>
        <li><a href="/doc/get-started/evaluation/">Evaluation Workflow</a><p>Learn how to participate in the evaluation, what participants should provide, and where the evaluation result will be shown.</p></li>
        <li><a href="/doc/get-started/protocol/metrics/">Metrics</a><p>Understand the four capability dimensions, scoring rules and meanings of the metrics, helping you to better comprehend the evaluation result.</p></li>
      </ol>
    </Section>
    <Section id="evaluation-responsibilities" title="Characters">
      <p>Participants need to share either a open-source model or closed-source inference service and adapter to participate the evaluation. The RoboValue team will handle integration review, reference for one-shot track, private evaluation, scoring, and then provide results. See <a href="/doc/get-started/evaluation/">Evaluation Workflow</a> for more details.</p>
    </Section>
    <Section id="before-participating" title="Preparation for Participatation">
      <p>First, complete the form on the Eval page and contact us. Then, choose an evaluation track: Zero-Shot, One-Shot, or Full-Shot. Specify the inputs your model accepts and the types of predictions it produces. Those preparation is important for a reliable evaluation.</p>
      <p>Read the <a href="/doc/get-started/protocol/evaluation/#dataset-references">reference and fine-tuning policy</a> before preparing your model.</p>
    </Section>
  </div>;
}

export function DatasetGuide() {
  return <div className="doc-content">
    <p className="doc-lead">Learn about the features of dataset and how to access training trajectories</p>
    <div className="doc-reading-cards">
      <a href="/doc/get-started/data/overview/"><span className="doc-reading-card-title">Overview<span aria-hidden="true">→</span></span><p>Training demonstrations, evaluation trajectories, and diagnostic coverage.</p></a>
      <a href="/doc/get-started/data/download/"><span className="doc-reading-card-title">Download<span aria-hidden="true">→</span></span><p>Training-data access for model preparation.</p></a>
    </div>
  </div>;
}

export function DatasetOverview() {
  return <div className="doc-content">
    <p className="doc-lead">RoboValue covers manipulation tasks in two domains: <strong>Simulation</strong>, using simulated environments, and <strong>Real World</strong>, using physical robots.</p>
    <p id="dataset-conditions">In both domains, the <strong>Standard (ID)</strong> condition uses each task's default robot embodiment and environment. <strong>Cross-Embodiment (EMB-OOD)</strong> changes the robot platform, while <strong>Cross-Environment (ENV-OOD)</strong> changes the environment.</p>
    <Section id="dataset-splits" title="Training Trajectories">
      <p>The whole training dataset are collected under standard conditions and contains only success trajectories. For tasks evaluated with CSVC, it may also include trajectories following different valid solution.</p>
      <p>See <a href="/doc/get-started/data/download/">Download</a> for training data access.</p>
    </Section>
    <Section id="dataset-test" title="Evaluation Trajectories">
      <PrivateTestNotice />
      <p>Evaluation trajectories include both successful executions and diagnostic trajectories designed to probe specific model capabilities. See <a href="/doc/diagnostic-trajectories/">Diagnostic Trajectories</a> for details.</p>
      <p>For task specifications, you can take a look at <a href="/doc/simulation-tasks/">Simulation Tasks</a> and <a href="/doc/real-world-tasks/">Real-World Tasks</a>.</p>
    </Section>

    <Section id="dataset-observations" title="Observations">
      <p><strong>Visual observations.</strong> Each trajectory records synchronized RGB-D observations from three cameras: one head camera and two wrist cameras on each wrist.</p>
      <p><strong>Robot states.</strong> Robot states are recorded alongside the camera observations. The available state fields may vary between simulation and real-world data and across robot embodiments. However EPOS is available in all settings.</p>
    </Section>
    <Section id="dataset-annotation" title="Annotation">
      <p><strong>Subtask boundaries.</strong> For successful trajectories, including <a href="/doc/diagnostic-trajectories/multi-solution/">multi-solution trajectories</a>, we annotate the start and end of each subtask. These annotations provide ground truth for identifying the active subtask in <a href="/doc/get-started/protocol/metrics/sia/">SIA</a> and define the boundaries used to compare subtask value gains across valid solutions in <a href="/doc/get-started/protocol/metrics/csvc/">CSVC</a>.</p>
      <p><strong>Failure stages.</strong> For <a href="/doc/diagnostic-trajectories/failure-and-recovery/">failure and recovery trajectories</a>, we annotate the start and end of the initial failure stage, along with the endpoint of the subtask in which the failure occurs. These timestamps provide ground truth for failure localization in <a href="/doc/get-started/protocol/metrics/fpl/">FPL</a> and define the failure and continued-error intervals evaluated by <a href="/doc/get-started/protocol/metrics/trr/">TRR</a>.</p>
      <p><strong>Recovery outcomes.</strong> For <a href="/doc/diagnostic-trajectories/failure-and-recovery/">Effective Recovery and Ineffective Recovery trajectories</a>, we also annotate when the recovery outcome becomes observable. This timestamp separates the recovery attempt from its outcome, allowing <a href="/doc/get-started/protocol/metrics/trr/">TRR</a> to assess whether value trends distinguish a recovery attempt from its success or failure.</p>
    </Section>
  </div>;
}

export function DatasetDownload() {
  return <div className="doc-content">
    <p className="doc-lead">Here is a link to access the training trajectories used for model preparation.</p>
    <Section id="dataset-training" title="Training Data">
      <p>Each simulation and real-world task has 100 expert training trajectories, collected under standard in-domain conditions.</p>
      <p>The training set contains only successful trajectories, with annotations limited to subtask boundaries.</p>
      <div className="doc-download-panel"><div><strong>Training data on Hugging Face</strong><p>The download link will be added here when available.</p></div><TrainingDownloadLink /></div>
    </Section>

  </div>;
}
