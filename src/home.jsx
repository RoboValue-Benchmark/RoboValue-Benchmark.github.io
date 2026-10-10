import React, { useState } from 'react';
import { Icon } from './benchmark';
import { ZoomableFigure } from './figure-viewer';
import { RankingModel } from './ranking-model';
import { BenchmarkOverview } from './benchmark-overview';
import { HeroBackground } from './hero-background';
import { GROUPS } from './benchmark-metrics';
import { DEFAULT_VIEW, TRACKS, scoreHighlights, viewURL } from './leaderboard-utils';
import { useResults } from './use-results';
import { useHomeReveal } from './use-home-reveal';
import taskData from './data/tasks.json';
import './home.css';
import { INSTITUTIONS } from './project-info';

const AUTHORS = [
  ['Shengbang Liu', '1,2,*'], ['Zhengye Du', '1,2,*'], ['Zhilong Wan', '1,2,*'], ['Honghao Su', '3,*'],
  ['Chenxiang Xia', '1'], ['Chang Ge', '4'], ['Jinyang Xiao', '4'], ['Nan Wang', '2,†'],
  ['Zhipeng Hu', '1'], ['Huining Yuan', '1'], ['Shu’ang Yu', '1'], ['Yue Chen', '3,5'],
  ['Tianxing Chen', '3,6'], ['Chuankang Li', '2'], ['Maoqing Yao', '2'], ['Wenbo Ding', '1,3'],
  ['Yu Wang', '1'], ['Guanghui Ren', '2,‡'], ['Chao Yu', '1,‡'],
];
const AFFILIATIONS = INSTITUTIONS.map(([name]) => name);
const INSTITUTION_LOGOS = INSTITUTIONS.map(([, file]) => file);
const CONDITIONS = { id: 'Standard', emb: 'Cross-Embodiment', env: 'Cross-Environment' };
const CONDITION_ORDER = Object.keys(CONDITIONS);
const TASK_SETTINGS = {
  simulation: {
    id: { robot: 'ARX', scene: 'Standard scene conditions' },
    emb: { robot: 'Dual-arm UR5e', scene: 'Robot platform changed from ARX' },
    env: { robot: 'ARX', scene: 'Varied surface appearance, lighting, and clutter' },
  },
  'real-world': {
    id: { robot: 'AgiBot Genie02', scene: 'Standard scene conditions' },
    emb: { robot: 'Dual-arm ARX', scene: 'Robot platform changed from AgiBot Genie02' },
    env: { robot: 'AgiBot Genie02', scene: 'Varied tablecloth color, lighting, and tabletop clutter' },
  },
};
const taskPath = item => `/doc/${item.domain}-tasks/${item.slug}/`;
const score = value => value == null ? '—' : value.toFixed(2);
const leaderboardHref = (track, patch = {}) => {
  const url = viewURL({ ...DEFAULT_VIEW, track, ...patch }, new URL('/leaderboard/', window.location.href));
  return url.pathname + url.search + url.hash;
};
function ResourceEntry({ label, icon, logo, href, status, external = false, arrow = false }) {
  const content = <>{logo ? <img className="rv-entry-logo" src={`/assets/resource-icons/${logo}.svg`} alt="" width="20" height="20" aria-hidden="true" /> : <Icon name={icon} size={20} />}<strong>{label}</strong>{status && <span className="rv-entry-status">{status}</span>}{(external || (href && arrow)) && <Icon className="rv-entry-arrow" name={external ? 'external' : 'arrow'} size={14} />}</>;
  return href
    ? <a className="rv-entry" data-icon={logo || icon} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>
    : <button className="rv-entry rv-entry-pending" data-icon={logo || icon} type="button" disabled>{content}</button>;
}
function ResearchDetails() {
  return <section className="rv-paper" id="paper" aria-labelledby="paper-title">
    <HeroBackground />
    <div className="rv-container rv-narrow">
      <h1 id="paper-title">RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1>
      <dl className="rv-paper-details">
        <dt>Authors</dt><dd><div className="rv-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation]) => {
          const [numbers, role] = affiliation.split(/,(?=[*†‡])/);
          return <span key={name}>{name}<sup>{numbers}{role && <span className="rv-author-role">,{role}</span>}</sup></span>;
        })}</div><p className="rv-author-notes"><span className="rv-author-role">*</span> Equal contribution <span className="rv-note-separator">·</span> <span className="rv-author-role">†</span> Project leader <span className="rv-note-separator">·</span> <span className="rv-author-role">‡</span> Corresponding authors</p></dd>
        <dt>Affiliations</dt><dd><div className="rv-affiliations" aria-label="Affiliations">{AFFILIATIONS.map((name, index) => <span key={name}><sup>{index + 1}</sup>{name}</span>)}</div><div className="rv-institutions" aria-label="Institution logos">{INSTITUTION_LOGOS.map((file, index) => <img key={file} className={file === 'hku.png' ? 'rv-institution-hku' : undefined} src={`/assets/affiliations/${file}`} alt={AFFILIATIONS[index]} width="180" height="48" loading="eager" />)}</div></dd>
      </dl>
      <div className="rv-paper-entries" aria-label="Project links">
        <div className="rv-release-grid">
          <ResourceEntry label="Report" logo="arxiv" status="arXiv" external />
          <ResourceEntry label="Document" icon="book" href="/doc/" arrow />
          <ResourceEntry label="Code" logo="github" href="https://github.com/RoboValue-Benchmark/RoboValue" status="GitHub" external />
          <ResourceEntry label="Dataset" icon="database" />
        </div>
        <div className="rv-paper-links">
          <ResourceEntry label="Leaderboard" icon="trophy" href="/leaderboard/" arrow />
          <ResourceEntry label="Community" icon="conversation" href="/community/" arrow />
        </div>
      </div>
    </div>
  </section>;
}

function OverviewVideo() {
  return <section className="rv-video-section" id="video" aria-labelledby="video-title">
    <div className="rv-video-container rv-reveal">
      <div className="rv-video-heading"><h2 className="rv-eyebrow rv-video-eyebrow" id="video-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" /></svg>Overview</h2></div>
      <div className="rv-video-placeholder"><p>Video coming soon</p></div>
    </div>
  </section>;
}

function Introduction() {
  return <section className="rv-introduction-section" id="overview" aria-label="RoboValue overview">
    <div className="rv-container rv-narrow">
      <div className="rv-introduction">
        <p className="rv-reveal">Robotic value models assess task execution from visual observations and instructions, providing feedback for policy learning and execution monitoring. However, strong outcome discrimination and forward-progress correlation do not establish whether this feedback faithfully reflects task requirements and intermediate execution events.</p>
        <ZoomableFigure className="rv-overview-figure rv-reveal" title="Overview of RoboValue" src="/assets/overview-10-09.svg" alt="Overview of RoboValue: simulation and real-world data, shared interfaces, resources, and diagnostic designs across four capability dimensions" caption="Overview of RoboValue: unified evaluation of robotic value models across four complementary dimensions in simulation and the real world." />
        <p className="rv-reveal">We introduce <strong className="rv-brand-name rv-brand-primary">RoboValue</strong>, a fine-grained sim-and-real benchmark for unified evaluation of robotic value models.</p>
        <p className="rv-reveal"><strong className="rv-brand-name">RoboValue-Dataset</strong> provides expert training demonstrations and annotated test trajectories across <strong className="rv-data-emphasis">15 simulation and 20 real-world manipulation tasks</strong>. Contrasts in task instructions, execution history, recovery outcomes, and valid subtask orders expose unreliable value judgments. Separate embodiment and environment shifts test generalization.</p>
        <p className="rv-reveal"><strong className="rv-brand-name">RoboValue-Benchmark</strong> evaluates four complementary capabilities: {GROUPS.map((group, index) => <React.Fragment key={group.id}>{index > 0 && (index === GROUPS.length - 1 ? ', and ' : ', ')}<strong className="rv-capability-name" style={{ '--capability-color': `var(--rv-capability-${group.id}, ${group.color})` }}>{group.title.toLowerCase()}</strong></React.Fragment>)}. Shared interfaces and model-specific adapters enable comparison across heterogeneous models while preserving their native value semantics.</p>
        <p className="rv-reveal">We establish <strong className="rv-brand-name">RoboValue-Leaderboard</strong> with separate overall rankings and capability profiles for zero-shot and one-shot evaluation. Our analyses distinguish instruction insensitivity from incorrect semantic grounding and reveal weaknesses in history awareness, recovery reasoning, and subtask credit. These findings inform future value supervision for policy learning, action planning, and execution monitoring.</p>
      </div>
    </div>
  </section>;
}

function News() {
  return <section className="rv-news-section" id="news" aria-labelledby="news-title">
    <div className="rv-container rv-narrow rv-reveal">
      <h2 className="rv-eyebrow" id="news-title">NEWS</h2>
      <div className="rv-news-placeholder"><p>Updates coming soon.</p></div>
    </div>
  </section>;
}

function TaskTile({ item, condition }) {
  return <a className="rv-task-tile" href={taskPath(item)} data-task-id={item.id} aria-label={`${item.title}: ${CONDITIONS[condition]}. View task details.`}>
    <img src={item.images[condition]} alt={`${item.title}: ${CONDITIONS[condition]}`} loading="lazy" width="640" height="480" />
    <span>{item.title}<Icon size={15} /></span>
  </a>;
}

function TaskGallery({ domain }) {
  const [condition, setCondition] = useState('id');
  const simulation = domain === 'simulation';
  const items = taskData.tasks.filter(item => item.domain === domain);
  const name = simulation ? 'Simulation' : 'Real-world';
  const galleryId = `${domain}-task-gallery`;
  const setting = TASK_SETTINGS[domain][condition];
  const changeCondition = direction => setCondition(current => CONDITION_ORDER[(CONDITION_ORDER.indexOf(current) + direction + CONDITION_ORDER.length) % CONDITION_ORDER.length]);
  return <section className={`rv-task-suite rv-${simulation ? 'simulation' : 'real'}-suite`} id={simulation ? 'tasks' : 'real-world'} aria-labelledby={`${domain}-title`}>
    <div className="rv-container">
      <div className="rv-centered-heading rv-reveal"><p className="rv-eyebrow">DATASET</p><h2 id={`${domain}-title`}>RoboValue {simulation ? 'Simulation' : 'Real-World'} Tasks</h2></div>
      <div className="rv-condition-controls rv-reveal">
        <button className="rv-condition-arrow" type="button" aria-label={`Previous ${name.toLowerCase()} condition`} aria-controls={galleryId} onClick={() => changeCondition(-1)}><Icon className="rv-previous" name="chevron" size={20} /></button>
        <div className="rv-condition-switch" role="group" aria-label={`${name} viewing condition`}>{Object.entries(CONDITIONS).map(([id, label]) => <button type="button" key={id} aria-pressed={condition === id} aria-controls={galleryId} onClick={() => setCondition(id)}>{label}</button>)}</div>
        <button className="rv-condition-arrow" type="button" aria-label={`Next ${name.toLowerCase()} condition`} aria-controls={galleryId} onClick={() => changeCondition(1)}><Icon name="chevron" size={20} /></button>
      </div>
      <div className="rv-gallery-viewport rv-reveal" id={galleryId} tabIndex={0} role="region" aria-label={`All ${items.length} ${name.toLowerCase()} tasks: ${CONDITIONS[condition]}`}><div className="rv-task-wall">{items.map(item => <TaskTile key={item.id} item={item} condition={condition} />)}</div></div>
      <div className="rv-suite-description rv-reveal">
        <p className="rv-task-context" aria-live="polite"><strong>{setting.robot}</strong><span className="rv-context-separator" aria-hidden="true">·</span><span>{setting.scene}</span></p>
        <a className="rv-text-link" href={`/doc/${domain}-tasks/catalog/`}>Explore all {items.length} {simulation ? 'simulation' : 'real-world'} tasks<Icon size={17} /></a>
      </div>
    </div>
  </section>;
}

function HomeResults() {
  const { data, error, retry } = useResults();
  const [track, setTrack] = useState('zero');
  const rows = (data?.rows || []).filter(row => row.setting === track).sort((a, b) => a.aggregate.rank - b.aggregate.rank);
  const columns = ['overall', ...GROUPS.map(group => group.id)];
  const highlights = scoreHighlights(rows, 'aggregate', columns);
  const colors = { understanding: '#366c9a', tracking: '#447d64', diagnosis: '#a56f2d', consistency: '#a45368' };
  const renderScore = (value, key) => <span className={value === highlights[key]?.best ? 'rv-score-best' : value === highlights[key]?.second ? 'rv-score-second' : ''}>{score(value)}</span>;
  return <section className="rv-section rv-results" id="results" aria-labelledby="home-results-title"><div className="rv-container">
    <div className="rv-section-heading rv-reveal"><div><p className="rv-eyebrow">LEADERBOARD</p><h2 id="home-results-title">RoboValue Leaderboard</h2></div><a className="rv-text-link rv-participate" href="/doc/get-started/adapters/">Participate in evaluation<Icon size={16} /></a></div>
    <div className="rv-preview rv-reveal">
      <div className="rv-preview-top"><div className="rv-small-switch" role="group" aria-label="Homepage evaluation track">{Object.entries(TRACKS).map(([id, label]) => <button type="button" key={id} aria-pressed={track === id} aria-controls="home-results-table" onClick={() => setTrack(id)}>{label}</button>)}</div></div>
      <p className="rv-preview-description">{track === 'zero' ? 'Released checkpoints, without task-specific adaptation or reference demonstrations.' : 'One standard training demonstration per task, used for conditioning or adaptation; test trajectories are held out.'}</p>
      <div className="rv-preview-scroll" role="region" aria-label="Homepage leaderboard results" tabIndex={0}><table className="rv-preview-table" id="home-results-table"><caption className="sr-only">All models in the {TRACKS[track]} track, ranked by Overall. Capability scores reproduce Table 2 of the 10-09 manuscript and range from 0 to 100; higher is better.</caption><thead><tr><th scope="col">Rank</th><th scope="col">Model</th><th scope="col" className="rv-preview-overall">Overall</th>{GROUPS.map(group => <th scope="col" key={group.id} style={{ '--capability-color': colors[group.id] }} title={group.title}>{group.short}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td className="rv-rank">{row.aggregate.rank}</td><th scope="row"><RankingModel row={row} /></th><td className="rv-preview-overall">{renderScore(row.aggregate.overall, 'overall')}</td>{GROUPS.map(group => <td key={group.id}>{renderScore(row.aggregate[group.id], group.id)}</td>)}</tr>)}{!rows.length && <tr><td colSpan={7} className="rv-preview-empty" aria-live="polite">{error ? <><strong>Results could not be loaded.</strong><button type="button" className="rv-text-link" onClick={retry}>Try again<Icon size={15} /></button></> : 'Loading manuscript results…'}</td></tr>}</tbody></table></div>
      <div className="rv-preview-legend"><b>Best</b> · <span className="rv-score-second">Second best</span> · 0–100, higher is better</div>
      <div className="rv-preview-footer"><span>Overall = mean of four capability scores · SIA reported separately</span><a href="/doc/get-started/protocol/">Scoring &amp; metrics<Icon size={15} /></a></div>
      {track === 'zero' && <p className="rv-preview-note">‡ TOPReward uses Qwen3-VL-8B. RoboReward’s unmeasured VS and CSVC count as zero in aggregate scoring.</p>}
    </div>
    <div className="rv-results-link rv-reveal"><a className="rv-text-link" href={leaderboardHref(track)}>View the {TRACKS[track].toLowerCase()} leaderboard<Icon size={18} /></a></div>
  </div></section>;
}

function EvaluationFramework() {
  return <section className="rv-section rv-framework" id="framework" aria-labelledby="framework-title"><div className="rv-container">
    <div className="rv-section-heading rv-reveal"><div><p className="rv-eyebrow">EVALUATION FRAMEWORK</p><h2 id="framework-title">Shared interfaces. Complementary diagnostics.</h2></div><p>A shared protocol compares execution judgments across heterogeneous models while preserving their native value semantics.</p></div>
    <div className="rv-workflow rv-reveal"><BenchmarkOverview /><p className="rv-track-note">Current results cover Zero-Shot and One-Shot evaluation. The Full-Shot track is planned to open with the dataset release.</p><div className="rv-framework-links"><a className="rv-text-link" href="/doc/get-started/protocol/">Protocol and metrics<Icon size={17} /></a><a className="rv-text-link" href="/doc/get-started/evaluation/">Evaluation workflow<Icon size={17} /></a></div></div>
  </div></section>;
}

function Community() {
  return <section className="rv-resources" id="community" aria-labelledby="community-title">
    <div className="rv-container rv-narrow rv-reveal">
      <p className="rv-eyebrow">COMMUNITY</p>
      <h2 id="community-title">Join the RoboValue community</h2>
      <p className="rv-community-description">Discuss the benchmark, evaluation, and robotic value models.</p>
      <div className="rv-resource-links"><a href="/community/">Join the WeChat group<Icon size={17} /></a></div>
    </div>
  </section>;
}

function Citation() {
  return <section className="rv-citation" id="citation" aria-labelledby="citation-title"><div className="rv-container rv-narrow rv-reveal"><p className="rv-eyebrow">CITATION</p><h2 id="citation-title">Cite our work</h2><div className="rv-citation-placeholder"><p>Citation details will be added when the public paper is released.</p></div></div></section>;
}

export function PublicHome() {
  const revealRoot = useHomeReveal();
  return <main ref={revealRoot} className="public-home rv-home" id="main-content" tabIndex={-1}>
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
