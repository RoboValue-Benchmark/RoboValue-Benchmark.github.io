import React, { useRef, useState } from 'react';
import { Figure, Icon } from './benchmark';
import { ModelLogo } from './model-logo';
import { BenchmarkOverview } from './benchmark-overview';
import { HomeDiagnostics } from './home-diagnostics';
import { GROUPS, METRICS } from './benchmark-metrics';
import { DEFAULT_VIEW, TRACKS, modelName, viewURL } from './leaderboard-utils';
import { paperFindings } from './paper-findings';
import { useResults } from './use-results';
import taskData from './data/tasks.json';
import './home.css';

const AUTHORS = [
  ['Shengbang Liu', '1,2,*'], ['Zhengye Du', '1,2,*'], ['Zhilong Wan', '1,2,*'], ['Honghao Su', '3,*'],
  ['Chenxiang Xia', '1'], ['Chang Ge', '4'], ['Jinyang Xiao', '4'], ['Nan Wang', '2,†'],
  ['Zhipeng Hu', '1'], ['Huining Yuan', '1'], ['Shu’ang Yu', '1'], ['Yue Chen', '3,5'],
  ['Tianxing Chen', '3,6'], ['Chuankang Li', '2'], ['Maoqing Yao', '2'], ['Wenbo Ding', '1,3'],
  ['Yu Wang', '1'], ['Guanghui Ren', '2,‡'], ['Chao Yu', '1,‡'],
];
const AFFILIATIONS = ['Tsinghua University', 'AgiBot', 'Xspark AI', 'Sun Yat-sen University', 'Peking University', 'The University of Hong Kong'];
const INSTITUTION_LOGOS = ['tsinghua.svg', 'agibot.jpg', 'xspark.png', 'sun-yat-sen.png', 'peking.png', 'hku.png'];
const CONDITIONS = { id: 'Standard (ID)', emb: 'Embodiment shift', env: 'Environment shift' };
const task = id => taskData.tasks.find(item => item.id === id);
const taskPath = item => `/doc/${item.domain}-tasks/${item.slug}/`;
const score = value => value == null ? '—' : value.toFixed(2);
const leaderboardHref = (track, patch = {}) => {
  const url = viewURL({ ...DEFAULT_VIEW, track, ...patch }, new URL('/leaderboard/', window.location.href));
  return url.pathname + url.search + url.hash;
};
function ResourceEntry({ label, icon, logo, href, status, external = false, arrow = false }) {
  const content = <>{logo ? <img className="rv-entry-logo" src={`/assets/resource-icons/${logo}.svg`} alt="" width="20" height="20" aria-hidden="true" /> : <Icon name={icon} size={20} />}<strong>{label}</strong>{status && <span className="rv-entry-status">{status}</span>}{href && (external || arrow) && <Icon className="rv-entry-arrow" name={external ? 'external' : 'arrow'} size={14} />}</>;
  return href
    ? <a className="rv-entry" data-icon={logo || icon} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>
    : <button className="rv-entry rv-entry-pending" data-icon={logo || icon} type="button" disabled>{content}</button>;
}
function ResearchDetails() {
  return <section className="rv-paper" id="paper" aria-labelledby="paper-title">
    <div className="rv-container rv-narrow">
      <h1 id="paper-title">RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1>
      <dl className="rv-paper-details">
        <dt>Authors</dt><dd><div className="rv-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation]) => {
          const [numbers, role] = affiliation.split(/,(?=[*†‡])/);
          return <span key={name}>{name}<sup>{numbers}{role && <span className="rv-author-role">,{role}</span>}</sup></span>;
        })}</div><p className="rv-author-notes"><span className="rv-author-role">*</span> Equal contribution <span className="rv-note-separator">·</span> <span className="rv-author-role">†</span> Project leader <span className="rv-note-separator">·</span> <span className="rv-author-role">‡</span> Corresponding authors</p></dd>
        <dt>Affiliations</dt><dd><div className="rv-affiliations" aria-label="Affiliations">{AFFILIATIONS.map((name, index) => <span key={name}><sup>{index + 1}</sup>{name}</span>)}</div><div className="rv-institutions" aria-label="Institution logos">{INSTITUTION_LOGOS.map((file, index) => <img key={file} className={file === 'hku.png' ? 'rv-institution-hku' : undefined} src={`/assets/affiliations/${file}`} alt={AFFILIATIONS[index]} width="180" height="48" loading="lazy" />)}</div></dd>
        <dt className="rv-entry-label">Resources</dt><dd className="rv-release-grid">
          <ResourceEntry label="Paper" icon="paper" status="Coming soon" />
          <ResourceEntry label="arXiv" logo="arxiv" status="Coming soon" />
          <ResourceEntry label="Code" logo="github" href="https://github.com/RoboValue-Benchmark/RoboValue" status="GitHub" external />
          <ResourceEntry label="Dataset" icon="database" href="/data/" status="Coming soon" />
        </dd>
        <dt className="rv-entry-label">Explore</dt><dd className="rv-paper-links">
          <ResourceEntry label="Leaderboard" icon="trophy" href="/leaderboard/" arrow />
          <ResourceEntry label="Document" icon="book" href="/doc/" arrow />
          <ResourceEntry label="Community" icon="conversation" href="/community/" arrow />
        </dd>
      </dl>
    </div>
  </section>;
}

function OverviewVideo() {
  return <section className="rv-video-section" id="video" aria-labelledby="video-title">
    <div className="rv-container rv-narrow">
      <p className="rv-eyebrow">OVERVIEW VIDEO</p>
      <div className="rv-video-placeholder"><p id="video-title">Video coming soon</p></div>
    </div>
  </section>;
}

function Introduction() {
  return <section className="rv-introduction-section" id="overview" aria-labelledby="overview-title">
    <div className="rv-container rv-narrow">
      <p className="rv-eyebrow">INTRODUCTION</p>
      <h2 id="overview-title">Overview of RoboValue</h2>
      <div className="rv-introduction">
        <p>Robotic value models provide feedback for policy learning and execution monitoring. Strong outcome discrimination and forward-progress correlation alone do not establish whether this feedback accurately reflects task requirements and intermediate execution events. Values may rise during regression, rebound while an error remains unresolved, or fail to reflect accumulated progress when visually similar states recur.</p>
        <p><strong>RoboValue</strong> is a fine-grained sim-and-real benchmark for unified evaluation of robotic value models. It evaluates four complementary capabilities: {GROUPS.map((group, index) => <React.Fragment key={group.id}>{index > 0 && (index === GROUPS.length - 1 ? ', and ' : ', ')}<strong className="rv-capability-name" style={{ '--capability-color': group.color }}>{group.title}</strong></React.Fragment>)}. Shared interfaces and model-specific adapters enable comparisons across heterogeneous models while preserving their native value semantics.</p>
        <Figure className="rv-overview-figure" src="/assets/overview-10-09.webp" alt="RoboValue evaluation framework: simulation and real-world data, shared interfaces, and diagnostic designs across four capability dimensions" caption="RoboValue evaluation framework: diagnostic trajectories and instruction variations probe task requirements and changes throughout execution." />
        <p><strong>RoboValue-Dataset</strong> pairs expert demonstrations for model training with a separate annotated test set. Its simulation and real-world tasks include failure and recovery, recurring visual states, and alternative valid subtask orders. Standard conditions and separate shifts in robot embodiment and environment support evaluation of value judgments across execution settings.</p>
      </div>
      <DatasetStats />
      <div className="rv-overview-links"><a className="rv-text-link" href="/doc/get-started/data/">Explore the dataset<Icon size={17} /></a><a className="rv-text-link" href="/doc/get-started/protocol/">Read the evaluation protocol<Icon size={17} /></a></div>
    </div>
  </section>;
}

function News() {
  return <section className="rv-news-section" id="news" aria-labelledby="news-title">
    <div className="rv-container rv-narrow">
      <p className="rv-eyebrow">NEWS</p><h2 id="news-title">Latest updates</h2>
      <div className="rv-news-placeholder"><p>Updates coming soon.</p></div>
    </div>
  </section>;
}

function DatasetStats() {
  return <div className="rv-stats" aria-label="Benchmark statistics">{[
    ['35', 'Manipulation tasks', '15 simulation + 20 real world'],
    ['3,500', 'Training demonstrations', '100 expert demonstrations per task'],
    ['2,792', 'Held-out test trajectories', 'Separate from the training split'],
    ['4', 'Capability dimensions', 'A shared diagnostic protocol'],
  ].map(([value, label, detail]) => <div key={label}><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>)}</div>;
}

function TaskTile({ item, condition }) {
  return <a className="rv-task-tile" href={taskPath(item)} data-task-id={item.id} aria-label={`${item.title}: ${CONDITIONS[condition]}. View task details.`}>
    <img src={item.images[condition]} alt={`${item.title}: ${CONDITIONS[condition]}`} loading="lazy" width="640" height="480" />
    <span>{item.title}<Icon size={15} /></span>
  </a>;
}

function TaskGallery({ domain }) {
  const [condition, setCondition] = useState('id');
  const wall = useRef(null);
  const simulation = domain === 'simulation';
  const items = taskData.tasks.filter(item => item.domain === domain);
  const examples = ['organize-cosmetics-storage-box', 'arrange-flowers-and-reed-diffuser', 'organize-desktop-workstation'].map(slug => task(`real-world/${slug}`));
  const name = simulation ? 'Simulation' : 'Real-world';
  return <section className={`rv-task-suite rv-${simulation ? 'simulation' : 'real'}-suite`} id={simulation ? 'tasks' : 'real-world'} aria-labelledby={`${domain}-title`}>
    <div className="rv-container">
      <div className="rv-centered-heading"><p className="rv-eyebrow">{simulation ? 'SIMULATION' : 'REAL WORLD'}</p><h2 id={`${domain}-title`}>RoboValue {simulation ? 'Simulation' : 'Real-World'} Benchmark</h2></div>
      <div className="rv-condition-switch" role="group" aria-label={`${name} viewing condition`}>{Object.entries(CONDITIONS).map(([id, label]) => <button type="button" key={id} aria-pressed={condition === id} onClick={() => setCondition(id)}>{label}</button>)}</div>
      {!simulation && <div className="rv-real-showcase" aria-label={`Real-world task scenes: ${CONDITIONS[condition]}`}>{examples.map((item, index) => <a href={taskPath(item)} key={item.id} className={`rv-showcase-image rv-showcase-${index}`} aria-label={`Explore ${item.title}`}><img src={item.images[condition]} alt={`${item.title}: ${CONDITIONS[condition]}`} loading="lazy" width="1200" height="900" /><span>{item.title}<Icon size={17} /></span></a>)}</div>}
      {simulation && <div className="rv-gallery-viewport" tabIndex={0} role="region" aria-label="All 15 simulation tasks"><div className="rv-sim-wall">{items.map(item => <TaskTile key={item.id} item={item} condition={condition} />)}</div></div>}
      <div className="rv-suite-description">
        <p>{simulation ? <>Our <strong>15 simulation tasks</strong> span object arrangement, sequential interactions, and multi-step manipulation in Isaac Sim. Expert, failure and recovery, long-horizon, and multi-solution trajectories probe value feedback throughout execution.</> : <>Our <strong>20 real-world tasks</strong> bring the same diagnostic protocol to physical execution, from organizing everyday objects to repeated and dependency-aware actions. Embodiment and environment shifts test generalization beyond the standard setting.</>}</p>
        <p className="rv-task-context" aria-live="polite">{simulation ? 'Standard ARX → cross-embodiment UR5e' : 'Standard AgiBot Genie02 → cross-embodiment ARX'}<span>·</span>{CONDITIONS[condition]}</p>
        <a className="rv-text-link" href={`/doc/${domain}-tasks/catalog/`}>Explore all {items.length} {simulation ? 'simulation' : 'real-world'} tasks<Icon size={17} /></a>
      </div>
      {!simulation && <div className="rv-real-wall-section"><div className="rv-wall-heading"><span>All 20 real-world tasks</span><div><button type="button" aria-label="Previous real-world tasks" onClick={() => wall.current.scrollBy({ left: -550, behavior: 'smooth' })}><Icon className="rv-previous" size={18} /></button><button type="button" aria-label="Next real-world tasks" onClick={() => wall.current.scrollBy({ left: 550, behavior: 'smooth' })}><Icon size={18} /></button></div></div><div className="rv-real-wall" ref={wall} role="region" aria-label="All 20 real-world tasks" tabIndex={0}>{items.map(item => <TaskTile key={item.id} item={item} condition={condition} />)}</div></div>}
    </div>
  </section>;
}

function HomeResults() {
  const { data, error, retry } = useResults();
  const [track, setTrack] = useState('zero');
  const rows = (data?.rows || []).filter(row => row.setting === track).sort((a, b) => a.aggregate.rank - b.aggregate.rank).slice(0, 5);
  const findings = paperFindings(data?.rows || [], track);
  return <section className="rv-section rv-results" id="results" aria-labelledby="home-results-title"><div className="rv-container">
    <div className="rv-section-heading"><div><p className="rv-eyebrow">VALUE MODEL LEADERBOARD</p><h2 id="home-results-title">Top 5 value models</h2></div><p>{data?.modelFamilies || 9} model families. {data?.rows.length || 18} evaluated configurations.<br />A shared view of four complementary capabilities.</p></div>
    <div className="rv-preview">
      <div className="rv-preview-top"><div className="rv-small-switch" role="group" aria-label="Preview evaluation track">{Object.entries(TRACKS).map(([id, label]) => <button type="button" key={id} aria-pressed={track === id} onClick={() => setTrack(id)}>{label}</button>)}</div><span>MANUSCRIPT RESULTS</span></div>
      <p className="rv-preview-description">{track === 'zero' ? 'Released checkpoints, without task-specific adaptation or reference demonstrations.' : 'One standard-scenario training demonstration per task, separate from all test trajectories.'}</p>
      <div className="rv-preview-scroll" role="region" aria-label="Scrollable top-five leaderboard" tabIndex={0}><table className="rv-preview-table"><caption className="sr-only">Top five models in the {TRACKS[track]} track. Overall and capability scores reproduce the manuscript leaderboard and range from 0 to 100; higher is better.</caption><thead><tr><th scope="col">Rank</th><th scope="col">Model</th><th scope="col">Overall</th>{GROUPS.map(group => <th scope="col" key={group.id}>{group.short}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><span className={`rv-rank rv-rank-${row.aggregate.rank}`}>{row.aggregate.rank}</span></td><th scope="row"><a className="rv-preview-model" href={leaderboardHref(track, { selected: [row.id] })}><ModelLogo name={row.name} /><span>{modelName(row)}</span></a></th><td className="rv-preview-overall"><strong>{score(row.aggregate.overall)}</strong></td>{GROUPS.map(group => <td key={group.id}>{score(row.aggregate[group.id])}</td>)}</tr>)}{!rows.length && <tr><td colSpan={7} className="rv-preview-empty" aria-live="polite">{error ? <><strong>Results could not be loaded.</strong><button type="button" className="rv-text-link" onClick={retry}>Try again<Icon size={15} /></button></> : 'Loading manuscript results…'}</td></tr>}</tbody></table></div>
      <div className="rv-preview-footer"><span>Overall = mean of four capability scores · SIA reported separately</span><a href="/leaderboard/#scoring">How scoring works<Icon size={15} /></a></div>
    </div>
    <div className="rv-results-link"><a className="rv-text-link" href={leaderboardHref(track)}>View the full {TRACKS[track].toLowerCase()} leaderboard<Icon size={18} /></a></div>
    {!!findings.length && <div className="rv-home-findings"><div className="rv-findings-heading"><h3>Beyond the overall score</h3><p>Standard (ID) · {TRACKS[track]} · Raw metric scores ×100</p></div><div className="rv-finding-grid">{findings.map(finding => <article key={finding.title}><h4>{finding.title}</h4><p className="rv-finding-model">{modelName(finding.row)}</p><div className="rv-finding-values">{[finding.left, finding.right].map(key => <div key={key}><span>{METRICS[key].label}</span><strong>{score(finding.row.conditions.id[key])}</strong></div>)}</div><p className="rv-finding-explanation">{finding.text}</p><a className="rv-text-link" href={leaderboardHref(track, { condition: 'id', capability: finding.capability, query: modelName(finding.row) })}>Explore these results<Icon size={15} /></a></article>)}</div></div>}
  </div></section>;
}

function EvaluationFramework() {
  return <section className="rv-section rv-framework" id="framework" aria-labelledby="framework-title"><div className="rv-container">
    <div className="rv-section-heading"><div><p className="rv-eyebrow">EVALUATION FRAMEWORK</p><h2 id="framework-title">Shared interfaces. Complementary diagnostics.</h2></div><p>A shared protocol compares execution judgments across heterogeneous models while preserving their native value semantics.</p></div>
    <div className="rv-workflow"><BenchmarkOverview /><p className="rv-track-note">Current results cover Zero-Shot and One-Shot evaluation. The Full-Data track is planned to open with the dataset release.</p><div className="rv-framework-links"><a className="rv-text-link" href="/doc/get-started/protocol/">Protocol and metrics<Icon size={17} /></a><a className="rv-text-link" href="/doc/get-started/evaluation/">Evaluation workflow<Icon size={17} /></a></div></div>
    <HomeDiagnostics />
  </div></section>;
}

function Community() {
  return <section className="rv-resources" id="community" aria-labelledby="community-title"><div className="rv-container rv-narrow"><p className="rv-eyebrow">COMMUNITY</p><h2 id="community-title">Join the RoboValue community</h2><p>Discuss the benchmark, evaluation, and robotic value models.</p><div className="rv-resource-links"><a href="/community/">Join the WeChat group<Icon size={17} /></a><a href="/doc/">Explore the documentation<Icon size={17} /></a></div></div></section>;
}

function Citation() {
  return <section className="rv-citation" id="citation" aria-labelledby="citation-title"><div className="rv-container rv-narrow"><p className="rv-eyebrow">CITATION</p><h2 id="citation-title">Cite our work</h2><div className="rv-citation-placeholder"><p>Citation details will be added when the public paper is released.</p></div></div></section>;
}

export function PublicHome() {
  return <main className="public-home rv-home" id="main-content" tabIndex={-1}>
    <ResearchDetails />
    <OverviewVideo />
    <Introduction />
    <News />
    <TaskGallery domain="simulation" />
    <TaskGallery domain="real-world" />
    <HomeResults />
    <EvaluationFramework />
    <Community />
    <Citation />
    <footer className="rv-footer rv-container"><a href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" width="154" height="51" /></a><p>A fine-grained view of robotic value models.</p><nav aria-label="Footer"><a href="/doc/">Documentation</a><a href="/leaderboard/">Leaderboard</a><a href="/community/">Community</a></nav></footer>
  </main>;
}
