import React, { useRef, useState } from 'react';
import { Icon } from './benchmark';
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
const HERO_SCENES = [
  { item: task('real-world/arrange-flowers-and-reed-diffuser'), label: 'SIMULATION + REAL WORLD', description: 'Fine-grained evaluation across 35 robotic manipulation tasks.' },
  { item: task('simulation/hang-mugs'), label: '15 SIMULATION TASKS', description: 'Understanding, tracking, diagnosis, and consistency in simulation.' },
  { item: task('real-world/organize-desktop-workstation'), label: '20 REAL-WORLD TASKS', description: 'From physical execution to a finer view of robotic value feedback.' },
];

function Hero() {
  const [slide, setSlide] = useState(0);
  const touchStart = useRef(null);
  const scene = HERO_SCENES[slide];
  const move = offset => setSlide(value => (value + offset + HERO_SCENES.length) % HERO_SCENES.length);
  return <section className="rv-cover" aria-labelledby="project-title" aria-roledescription="carousel" onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }}>
    <div className="rv-cover-viewport" onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => {
      if (touchStart.current == null) return;
      const distance = event.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
      touchStart.current = null;
    }}>
      <div className="rv-cover-track">
        {[-1, 0, 1].map(offset => {
          const imageScene = HERO_SCENES[(slide + offset + HERO_SCENES.length) % HERO_SCENES.length];
          return <div className={`rv-cover-panel ${offset === 0 ? 'is-current' : offset === -1 ? 'is-previous' : 'is-next'}`} key={offset} aria-hidden={offset !== 0 ? true : undefined}>
            <img src={imageScene.item.images.id} alt={offset === 0 ? `${imageScene.item.title}: standard benchmark scene` : ''} width="1200" height="900" fetchPriority={offset === 0 ? 'high' : 'auto'} />
          </div>;
        })}
        <div className="rv-cover-copy">
          <p className="rv-cover-eyebrow">{scene.label}</p>
          <h1 id="project-title">RoboValue</h1>
          <p className="rv-cover-subtitle">Sim-and-Real Value Model Benchmark</p>
          <p className="rv-cover-description">{scene.description}</p>
          <a className="rv-cover-link" href="#paper">Learn more<Icon size={19} /></a>
        </div>
        <p className="rv-cover-caption">{scene.item.domain === 'simulation' ? 'Simulation' : 'Real world'}<span>·</span>{scene.item.title}</p>
      </div>
    </div>
    <div className="rv-cover-controls" aria-label="Benchmark highlights">
      <button type="button" onClick={() => move(-1)} aria-label="Previous highlight"><Icon className="rv-previous" size={20} /></button>
      <div className="rv-cover-dots">{HERO_SCENES.map((item, index) => <button type="button" key={item.item.id} aria-label={`Show highlight ${index + 1}: ${item.item.title}`} aria-pressed={slide === index} onClick={() => setSlide(index)}><span /></button>)}</div>
      <button type="button" onClick={() => move(1)} aria-label="Next highlight"><Icon size={20} /></button>
      <span className="sr-only" aria-live="polite">Highlight {slide + 1} of {HERO_SCENES.length}: {scene.item.title}</span>
    </div>
  </section>;
}

function ResearchDetails() {
  return <section className="rv-paper" id="paper" aria-labelledby="paper-title">
    <div className="rv-container rv-narrow">
      <h2 id="paper-title">RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h2>
      <dl className="rv-paper-details">
        <dt>Authors</dt><dd><div className="rv-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation]) => <span key={name}>{name}<sup>{affiliation}</sup></span>)}</div><p className="rv-author-notes">* Equal contribution <span>·</span> † Project leader <span>·</span> ‡ Corresponding authors</p></dd>
        <dt>Affiliations</dt><dd><div className="rv-affiliations" aria-label="Affiliations">{AFFILIATIONS.map((name, index) => <span key={name}><sup>{index + 1}</sup>{name}</span>)}</div><div className="rv-institutions" aria-label="Institution logos">{INSTITUTION_LOGOS.map((file, index) => <img key={file} src={`/assets/affiliations/${file}`} alt={AFFILIATIONS[index]} width="180" height="48" loading="lazy" />)}</div></dd>
        <dt>Resources</dt><dd className="rv-release-grid">{['Paper', 'arXiv', 'Code', 'Dataset'].map(label => <button type="button" disabled key={label}><strong>{label}</strong><span>Coming soon</span></button>)}</dd>
        <dt>Explore</dt><dd className="rv-paper-links"><a href="/leaderboard/">Leaderboard<Icon size={16} /></a><a href="/doc/">Documentation<Icon size={16} /></a><a href="/community/">Community<Icon size={16} /></a></dd>
      </dl>
      <div className="rv-introduction" id="overview">
        <p>Robotic value models guide data curation, policy optimization, and execution monitoring. But predicting success or correlating with forward progress tells only part of the story: a value may rise during regression, rebound before an error is resolved, or overlook the history behind a familiar visual state.</p>
        <p><strong>RoboValue</strong> evaluates four complementary capabilities: task-state understanding, temporal progress monitoring, failure and recovery reasoning, and value consistency. A unified protocol connects heterogeneous value models with diagnostic trajectories in simulation and the real world.</p>
      </div>
      <DatasetStats />
      <div className="rv-workflow"><BenchmarkOverview /><a className="rv-text-link" href="/doc/get-started/protocol/">Explore the evaluation protocol<Icon size={17} /></a></div>
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
      <div className="rv-preview-top"><div className="rv-small-switch" role="group" aria-label="Preview evaluation track">{Object.entries(TRACKS).map(([id, label]) => <button type="button" key={id} aria-pressed={track === id} onClick={() => setTrack(id)}>{label}</button>)}</div><span>MANUSCRIPT RESULTS · TABLE 1</span></div>
      <p className="rv-preview-description">{track === 'zero' ? 'Released checkpoints, without task-specific adaptation or reference demonstrations.' : 'One standard-scenario training demonstration per task, separate from all test trajectories.'}</p>
      <div className="rv-preview-scroll" role="region" aria-label="Scrollable top-five leaderboard" tabIndex={0}><table className="rv-preview-table"><caption className="sr-only">Top five models in the {TRACKS[track]} track. Overall and capability scores reproduce Table 1 and range from 0 to 100; higher is better.</caption><thead><tr><th scope="col">Rank</th><th scope="col">Model</th><th scope="col">Overall</th>{GROUPS.map(group => <th scope="col" key={group.id}>{group.short}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><span className={`rv-rank rv-rank-${row.aggregate.rank}`}>{row.aggregate.rank}</span></td><th scope="row"><a className="rv-preview-model" href={leaderboardHref(track, { selected: [row.id] })}><ModelLogo name={row.name} /><span>{modelName(row)}</span></a></th><td className="rv-preview-overall"><strong>{score(row.aggregate.overall)}</strong></td>{GROUPS.map(group => <td key={group.id}>{score(row.aggregate[group.id])}</td>)}</tr>)}{!rows.length && <tr><td colSpan={7} className="rv-preview-empty" aria-live="polite">{error ? <><strong>Results could not be loaded.</strong><button type="button" className="rv-text-link" onClick={retry}>Try again<Icon size={15} /></button></> : 'Loading manuscript results…'}</td></tr>}</tbody></table></div>
      <div className="rv-preview-footer"><span>Overall = mean of four capability scores · SIA reported separately</span><a href="/leaderboard/#scoring">How scoring works<Icon size={15} /></a></div>
    </div>
    <div className="rv-results-link"><a className="rv-text-link" href={leaderboardHref(track)}>View the full {TRACKS[track].toLowerCase()} leaderboard<Icon size={18} /></a></div>
    {!!findings.length && <div className="rv-home-findings"><div className="rv-findings-heading"><h3>Beyond the overall score</h3><p>Standard (ID) · {TRACKS[track]} · Raw metric scores ×100</p></div><div className="rv-finding-grid">{findings.map(finding => <article key={finding.title}><h4>{finding.title}</h4><p className="rv-finding-model">{modelName(finding.row)}</p><div className="rv-finding-values">{[finding.left, finding.right].map(key => <div key={key}><span>{METRICS[key].label}</span><strong>{score(finding.row.conditions.id[key])}</strong></div>)}</div><p className="rv-finding-explanation">{finding.text}</p><a className="rv-text-link" href={leaderboardHref(track, { condition: 'id', capability: finding.capability, query: modelName(finding.row) })}>Explore these results<Icon size={15} /></a></article>)}</div></div>}
  </div></section>;
}

function Resources() {
  return <section className="rv-resources" id="resources" aria-labelledby="resources-title"><div className="rv-container rv-narrow"><h2 id="resources-title">Explore RoboValue</h2><p>Browse task specifications, evaluation definitions, and the full manuscript results.</p><div className="rv-resource-links"><a href="/doc/">Documentation<Icon size={17} /></a><a href="/leaderboard/">Leaderboard<Icon size={17} /></a><a href="/community/">Join the community<Icon size={17} /></a></div><p className="rv-release-note">The paper, code, and dataset are coming soon. Citation details will accompany the paper release.</p></div></section>;
}

export function PublicHome() {
  return <main className="public-home rv-home" id="main-content" tabIndex={-1}>
    <Hero /><ResearchDetails /><TaskGallery domain="simulation" /><TaskGallery domain="real-world" /><HomeResults />
    <div className="rv-container rv-diagnostics-container"><HomeDiagnostics /></div>
    <Resources /><footer className="rv-footer rv-container"><a href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" width="154" height="51" /></a><p>A fine-grained view of robotic value models.</p><nav aria-label="Footer"><a href="/doc/">Documentation</a><a href="/leaderboard/">Leaderboard</a><a href="/community/">Community</a></nav></footer>
  </main>;
}
