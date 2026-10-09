import React, { useState } from 'react';
import { Icon } from './benchmark';
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
const FEATURED_TASKS = {
  simulation: ['fill-pen-holder', 'hang-mugs', 'make-toast', 'press-by-number', 'fold-clothes', 'organize-table'],
  'real-world': ['organize-cosmetics-storage-box', 'arrange-flowers-and-reed-diffuser', 'strike-drum-five-times', 'organize-desktop-workstation', 'prepare-breakfast', 'pack-items-for-shipping'],
};
const task = id => taskData.tasks.find(item => item.id === id);
const taskPath = item => `/doc/${item.domain}-tasks/${item.slug}/`;
const score = value => value == null ? '—' : value.toFixed(2);
const leaderboardHref = (track, patch = {}) => {
  const url = viewURL({ ...DEFAULT_VIEW, track, ...patch }, new URL('/leaderboard/', window.location.href));
  return url.pathname + url.search + url.hash;
};

function Hero() {
  const [frame, setFrame] = useState(0);
  const scenes = [task('simulation/fill-pen-holder'), task('real-world/organize-cosmetics-storage-box')];
  return <section className="rv-hero" aria-labelledby="project-title">
    <div className="rv-hero-copy">
      <p className="rv-eyebrow"><i aria-hidden="true" />SIMULATION + REAL WORLD</p>
      <h1 id="project-title">Robo<span>Value</span><span className="sr-only">: a benchmark for robotic value models</span></h1>
      <p className="rv-hero-subtitle">A closer look at<br />robotic value feedback.</p>
      <p className="rv-hero-description">Fine-grained evaluation of what robotic value models understand, track, and diagnose throughout execution.</p>
      <div className="rv-hero-actions"><a className="rv-button rv-button-primary" href="/leaderboard/">View leaderboard<Icon /></a><a className="rv-button rv-button-secondary" href="#benchmark">Explore benchmark<Icon /></a></div>
      <nav className="rv-jump-nav" aria-label="Homepage sections"><a href="#results">Results</a><span>·</span><a href="#tasks">Tasks</a><span>·</span><a href="#evaluation">Protocol</a></nav>
    </div>
    <div className="rv-hero-stage">
      <div className="rv-stage-heading"><span>Two worlds. One evaluation.</span><span className="rv-live-label">35 TASKS</span></div>
      <div className="rv-hero-scenes">{scenes.map((item, index) => <figure key={item.id}><div className="rv-scene-image"><img src={item.sequence[frame]} alt={`${item.title}: execution keyframe ${frame + 1} of 7`} width="640" height="480" fetchPriority={index === 0 ? 'high' : 'auto'} /><span>{index === 0 ? 'SIMULATION' : 'REAL WORLD'}</span></div><figcaption><strong>{item.title}</strong><span>{index === 0 ? 'ARX · Isaac Sim' : 'AgiBot Genie02'}</span></figcaption></figure>)}</div>
      <div className="rv-keyframes"><div><span>Execution keyframes</span><strong aria-live="polite">{String(frame + 1).padStart(2, '0')} <small>/ 07</small></strong></div><label className="sr-only" htmlFor="hero-keyframe">Execution keyframe</label><input id="hero-keyframe" type="range" min="0" max="6" value={frame} aria-valuetext={`Keyframe ${frame + 1} of 7`} onChange={event => setFrame(Number(event.target.value))} /><button type="button" aria-label="Previous keyframe" disabled={frame === 0} onClick={() => setFrame(value => value - 1)}><Icon className="rv-previous" size={17} /></button><button type="button" aria-label="Next keyframe" disabled={frame === 6} onClick={() => setFrame(value => value + 1)}><Icon size={17} /></button></div>
      <div className="rv-stage-footnote"><span>Task-state understanding</span><span>Progress</span><span>Recovery</span><span>Consistency</span></div>
    </div>
  </section>;
}

function ResearchDetails() {
  return <section className="rv-research" aria-labelledby="paper-title"><p className="rv-eyebrow">ROBOVALUE BENCHMARK</p><h2 id="paper-title">A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h2><div className="rv-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation]) => <span key={name}>{name}<sup>{affiliation}</sup></span>)}</div><div className="rv-affiliations" aria-label="Affiliations">{AFFILIATIONS.map((name, index) => <span key={name}><sup>{index + 1}</sup>{name}</span>)}</div><p className="rv-author-notes">* Equal contribution <span>·</span> † Project leader <span>·</span> ‡ Corresponding authors</p><div className="rv-institutions" aria-label="Institution logos">{INSTITUTION_LOGOS.map((file, index) => <img key={file} src={`/assets/affiliations/${file}`} alt={AFFILIATIONS[index]} width="180" height="48" loading="lazy" />)}</div></section>;
}

function DatasetStats() {
  return <div className="rv-stats" aria-label="Benchmark statistics">{[
    ['35', 'Manipulation tasks', '15 simulation + 20 real world'],
    ['3,500', 'Training demonstrations', '100 expert demonstrations per task'],
    ['2,792', 'Held-out test trajectories', 'Separate from the training split'],
    ['4', 'Capability dimensions', 'A shared diagnostic protocol'],
  ].map(([value, label, detail]) => <div key={label}><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>)}</div>;
}

function HomeResults() {
  const { data, error, retry } = useResults();
  const [track, setTrack] = useState('zero');
  const rows = (data?.rows || []).filter(row => row.setting === track).sort((a, b) => a.aggregate.rank - b.aggregate.rank).slice(0, 5);
  const findings = paperFindings(data?.rows || [], track);
  return <section className="rv-section rv-results" id="results" aria-labelledby="home-results-title">
    <div className="rv-section-heading"><div><p className="rv-eyebrow">THE CURRENT PICTURE</p><h2 id="home-results-title">Explore the leaderboard.</h2></div><p>Compare {data?.modelFamilies || 9} value-model families across {data?.rows.length || 18} evaluated configurations. Each track has its own ranking and capability profiles.</p></div>
    <div className="rv-preview">
      <div className="rv-preview-top"><div className="rv-small-switch" role="group" aria-label="Preview evaluation track">{Object.entries(TRACKS).map(([id, label]) => <button type="button" key={id} aria-pressed={track === id} onClick={() => setTrack(id)}>{label}</button>)}</div><span>TOP 5 · MANUSCRIPT RESULTS</span><a href={leaderboardHref(track)}>Full leaderboard<Icon size={16} /></a></div>
      <p className="rv-preview-description">{track === 'zero' ? 'Released checkpoints, without task-specific adaptation or reference demonstrations.' : 'One standard-scenario training demonstration per task, separate from all test trajectories.'}</p>
      <div className="rv-preview-scroll" role="region" aria-label="Scrollable top-five leaderboard" tabIndex={0}><table className="rv-preview-table"><caption className="sr-only">Top five models in the {TRACKS[track]} track. Overall and capability scores reproduce Table 1 and range from 0 to 100; higher is better.</caption><thead><tr><th scope="col">Rank</th><th scope="col">Model</th><th scope="col">Overall</th>{GROUPS.map(group => <th scope="col" key={group.id} style={{ '--capability-color': group.color }}><i aria-hidden="true" />{group.short}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><span className={`rv-rank rv-rank-${row.aggregate.rank}`}>{row.aggregate.rank}</span></td><th scope="row"><a href={leaderboardHref(track, { selected: [row.id] })}>{modelName(row)}</a></th><td className="rv-preview-overall"><strong>{score(row.aggregate.overall)}</strong><span aria-hidden="true"><i style={{ width: `${row.aggregate.overall}%` }} /></span></td>{GROUPS.map(group => <td key={group.id}>{score(row.aggregate[group.id])}</td>)}</tr>)}{!rows.length && <tr><td colSpan={7} className="rv-preview-empty" aria-live="polite">{error ? <><strong>Results could not be loaded.</strong><button type="button" className="rv-text-link" onClick={retry}>Try again<Icon size={15} /></button></> : 'Loading manuscript results…'}</td></tr>}</tbody></table></div>
      <div className="rv-preview-footer"><span>Overall = mean of four capability scores · SIA reported separately</span><a href="/leaderboard/#scoring">How scoring works<Icon size={14} /></a></div>
    </div>
    {!!findings.length && <div className="rv-home-findings"><div className="rv-findings-heading"><h3>Beyond the overall score.</h3><p>Standard (ID) · {TRACKS[track]} · Raw metric scores ×100</p></div><div className="rv-finding-grid">{findings.map((finding, index) => <article key={finding.title} style={{ '--capability-color': GROUPS.find(group => group.id === finding.capability).color }}><span className="rv-finding-number">0{index + 1}</span><h4>{finding.title}</h4><p className="rv-finding-model">{modelName(finding.row)}</p><div className="rv-finding-values">{[finding.left, finding.right].map(key => <div key={key}><span>{METRICS[key].label}</span><strong>{score(finding.row.conditions.id[key])}</strong></div>)}</div><p className="rv-finding-explanation">{finding.text}</p><a className="rv-text-link" href={leaderboardHref(track, { condition: 'id', capability: finding.capability, query: modelName(finding.row) })}>Explore these results<Icon size={15} /></a></article>)}</div></div>}
  </section>;
}

function HomeTasks() {
  const [domain, setDomain] = useState('simulation');
  const [condition, setCondition] = useState('id');
  const conditions = { id: 'Standard (ID)', emb: 'Embodiment shift', env: 'Environment shift' };
  const selected = FEATURED_TASKS[domain].map(slug => task(`${domain}/${slug}`));
  return <section className="rv-section rv-tasks" id="tasks" aria-labelledby="home-tasks-title"><div className="rv-section-heading"><div><p className="rv-eyebrow">ROBOVALUE DATASET</p><h2 id="home-tasks-title">Two worlds.<br />A shared protocol.</h2></div><p>Explore task instructions, subtasks, and annotated keyframes. Expert demonstrations are complemented by failure, recovery, long-horizon, and multi-solution trajectories.</p></div><div className="rv-task-controls"><div className="rv-small-switch" role="group" aria-label="Task domain">{[['simulation', 'Simulation', 15], ['real-world', 'Real world', 20]].map(([id, label, count]) => <button type="button" key={id} aria-pressed={domain === id} onClick={() => setDomain(id)}>{label}<span>{count}</span></button>)}</div><div className="rv-condition-switch" role="group" aria-label="Task viewing condition">{Object.entries(conditions).map(([id, label]) => <button type="button" key={id} aria-pressed={condition === id} onClick={() => setCondition(id)}>{label}</button>)}</div></div><p className="rv-task-context" aria-live="polite">{domain === 'simulation' ? 'Isaac Sim · Standard ARX → cross-embodiment UR5e' : 'Physical execution · Standard AgiBot Genie02 → cross-embodiment ARX'}<span>Each shift varies either embodiment or environment.</span></p><div className="rv-task-grid">{selected.map(item => <a className="rv-task-card" key={item.id} href={taskPath(item)}><div><img src={item.images[condition]} alt={`${item.title}: ${conditions[condition]}`} loading="lazy" width="640" height="480" /><span>{conditions[condition]}</span></div><h3>{item.title}<Icon size={17} /></h3><p>{item.instruction}</p></a>)}</div><div className="rv-task-footer"><p>Six featured tasks from the {domain === 'simulation' ? '15-task simulation' : '20-task real-world'} suite.</p><a className="rv-text-link" href={`/doc/${domain}-tasks/catalog/`}>Browse all {domain === 'simulation' ? 15 : 20} tasks<Icon size={16} /></a></div></section>;
}

function EvaluationSummary() {
  return <section className="rv-section rv-evaluation" id="evaluation" aria-labelledby="home-evaluation-title"><div className="rv-section-heading"><div><p className="rv-eyebrow">UNIFIED EVALUATION</p><h2 id="home-evaluation-title">From trajectories<br />to capability profiles.</h2></div><p>Shared interfaces make heterogeneous models comparable while retaining the meaning of their native values. Simulation and real-world domains receive equal weight.</p></div><BenchmarkOverview /><div className="rv-evaluation-bottom"><p>Zero-shot and one-shot results are reported separately. A Full-Data Track is planned.</p><a className="rv-text-link" href="/doc/get-started/protocol/">Read the protocol and metrics<Icon size={17} /></a></div></section>;
}

function Resources() {
  return <section className="rv-resources" id="resources" aria-labelledby="resources-title"><div className="rv-resource-intro"><p className="rv-eyebrow">EXPLORE ROBOVALUE</p><h2 id="resources-title">Start with the benchmark.</h2><p>Task specifications, evaluation definitions, and manuscript results are available to explore.</p><div className="rv-resource-links"><a href="/doc/">Documentation<Icon size={16} /></a><a href="/leaderboard/">Leaderboard<Icon size={16} /></a><a href="/community/">Community<Icon size={16} /></a></div></div><div className="rv-release"><p className="rv-small-label">UPCOMING RELEASE</p><div className="rv-release-grid">{['Paper', 'arXiv', 'Code', 'Dataset'].map(label => <button type="button" disabled key={label}><strong>{label}</strong><span>Coming soon</span></button>)}</div><p>Citation details will accompany the public paper release.</p></div></section>;
}

export function PublicHome() {
  return <main className="public-home rv-home" id="main-content" tabIndex={-1}><div className="rv-container"><Hero /><ResearchDetails /><DatasetStats /><HomeDiagnostics /><HomeResults /><HomeTasks /><EvaluationSummary /><Resources /><footer className="rv-footer"><a href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" width="140" height="44" /></a><p>A fine-grained view of robotic value models.</p><nav aria-label="Footer"><a href="/doc/">Documentation</a><a href="/leaderboard/">Leaderboard</a><a href="/community/">Community</a></nav></footer></div></main>;
}
