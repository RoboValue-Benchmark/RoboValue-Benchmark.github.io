import React, { useState } from 'react';
import { Icon } from './benchmark';
import { ZoomableFigure } from './figure-viewer';
import { RankingModel } from './ranking-model';
import { HeroBackground } from './hero-background';
import { LoadingImage } from './loading-image';
import { GROUPS, CAPABILITY_TABLE_HEADERS } from './benchmark-metrics';
import { TRACKS, scoreHighlights } from './leaderboard-utils';
import { useResults } from './use-results';
import { useHomeReveal } from './use-home-reveal';
import taskData from './data/tasks.json';
import './home.css';
import { INSTITUTIONS } from './project-info';
import { DISCORD_INVITE } from './community';

const AUTHORS = [
  ['Shengbang Liu', '1,2,*', 'https://liushb9.github.io/'],
  ['Zhengye Du', '1,2,*', 'https://duzhengye-droid.github.io/'],
  ['Zhilong Wan', '1,2,*', 'https://loongwz.github.io/'],
  ['Honghao Su', '3,*', 'https://scholar.google.com/citations?user=gAcJUVQAAAAJ'],
  ['Chenxiang Xia', '1', 'https://xcxjasonhsia.github.io/'],
  ['Chang Ge', '4', 'https://gechang27.github.io/'],
  ['Jinyang Xiao', '4', 'https://xiaojy36.github.io/'],
  ['Nan Wang', '2,†', 'https://bigcileng.github.io/'],
  ['Zhipeng Hu', '1', 'https://huzp22.github.io/'],
  ['Huining Yuan', '1', 'https://huiningyuan.github.io/'],
  ["Shu'ang Yu", '1', 'https://scholar.google.com/citations?user=wb79fkMAAAAJ'],
  ['Yue Chen', '3,5', 'https://yuechen0614.github.io/'],
  ['Tianxing Chen', '3,6', 'https://tianxingchen.github.io/'],
  ['Chuankang Li', '2', 'https://github.com/lck1201'],
  ['Maoqing Yao', '2', 'https://openreview.net/profile?id=~Maoqing_Yao1'],
  ['Wenbo Ding', '1,3', 'https://ssr-group.net/'],
  ['Yu Wang', '1', 'https://nicsefc.ee.tsinghua.edu.cn/people/YuWang'],
  ['Guanghui Ren', '2,‡', 'https://sundrops.github.io/'],
  ['Chao Yu', '1,‡', 'https://zoeyuchao.github.io/'],
];
const AFFILIATIONS = INSTITUTIONS.map(([name]) => name);
const INSTITUTION_LOGOS = INSTITUTIONS.map(([, file]) => file);
const CONTENT_CHANNELS = [
  { name: 'Bilibili', icon: 'bilibili', href: null },
  { name: 'YouTube', icon: 'youtube', href: null },
  { name: '小红书', icon: 'xiaohongshu', href: null },
  { name: 'X', icon: 'x', href: null },
];
const CONDITIONS = { id: 'Standard', emb: 'Cross-Embodiment', env: 'Cross-Environment' };
const CONDITION_ORDER = Object.keys(CONDITIONS);
const TASK_SETTINGS = {
  simulation: {
    id: { robot: 'ARX', scene: 'Standard scene conditions' },
    emb: { robot: 'UR5e', scene: 'Robot platform changed from ARX' },
    env: { robot: 'ARX', scene: 'Varied surface appearance, lighting, and clutter' },
  },
  'real-world': {
    id: { robot: 'AgiBot Genie02', scene: 'Standard scene conditions' },
    emb: { robot: 'ARX', scene: 'Robot platform changed from AgiBot Genie02' },
    env: { robot: 'AgiBot Genie02', scene: 'Varied tablecloth color, lighting, and tabletop clutter' },
  },
};
const taskPath = item => `/doc/${item.domain}-tasks/${item.slug}/`;
const score = value => value == null ? '—' : value.toFixed(2);
// Table 1 includes SIA as an understanding capability, separately from aggregate scoring.
const CAPABILITY_METRICS = {
  understanding: [
    ['SA', 'Distinguish overall goal satisfaction from partial or failed execution.'],
    ['TGA-CT', 'Ground value judgments in language-specified goals across tasks.'],
    ['TGA-CF', 'Ground judgments in object, action, placement, and constraint requirements.'],
    ['SIA', 'Identify the active semantic subtask during execution.'],
  ],
  tracking: [
    ['VOC', 'Order intermediate states by progress toward task completion.'],
    ['Cycle-VOC', 'Distinguish progress direction from elapsed-time cues.'],
    ['Memory-VOC', 'Use execution history to resolve progress ambiguity at recurring visual states.'],
  ],
  diagnosis: [
    ['FPL', 'Locate the onset of task-relevant execution errors.'],
    ['TRR', 'Distinguish unresolved errors, corrective progress, and recovery outcomes.'],
  ],
  consistency: [
    ['VS', 'Maintain stable local feedback with informative updates.'],
    ['CSVC', 'Assign comparable gains to the same semantic subtask across valid execution orders.'],
  ],
};
function ResourceEntry({ label, icon, logo, href, status, external = false, arrow = false, arrowIcon = 'arrow' }) {
  const content = <>{logo ? <img className="rv-entry-logo" src={`/assets/resource-icons/${logo}.svg`} alt="" width="20" height="20" aria-hidden="true" /> : <Icon name={icon} size={20} />}<strong>{label}</strong>{status && <span className="rv-entry-status">{status}</span>}{(external || arrow) && <Icon className="rv-entry-arrow" name={external ? 'external' : arrowIcon} size={14} />}</>;
  return href
    ? <a className="rv-entry" data-icon={logo || icon} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>
    : <button className="rv-entry rv-entry-pending" data-icon={logo || icon} type="button" disabled>{content}</button>;
}
function ResearchDetails() {
  return <section className="rv-paper" id="paper" aria-labelledby="paper-title">
    <HeroBackground />
    <div className="rv-container rv-paper-panel">
      <h1 id="paper-title">RoboValue: A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</h1>
      <dl className="rv-paper-details">
        <dt>Authors</dt><dd><div className="rv-authors" aria-label="Authors">{AUTHORS.map(([name, affiliation, homepage]) => {
          const [numbers, role] = affiliation.split(/,(?=[*†‡])/);
          return <span key={name}>{homepage ? <a href={homepage} target="_blank" rel="noopener noreferrer">{name}</a> : name}<sup>{numbers}{role && <span className="rv-author-role">,{role}</span>}</sup></span>;
        })}</div><p className="rv-author-notes"><span className="rv-author-role">*</span> Equal contribution <span className="rv-note-separator">·</span> <span className="rv-author-role">†</span> Project leader <span className="rv-note-separator">·</span> <span className="rv-author-role">‡</span> Corresponding authors</p></dd>
        <dt>Affiliations</dt><dd><div className="rv-affiliations" aria-label="Affiliations">{AFFILIATIONS.map((name, index) => <span key={name}><sup>{index + 1}</sup>{name}</span>)}</div><div className="rv-institutions" aria-label="Institution logos">{INSTITUTION_LOGOS.map((file, index) => <img key={file} className={file === 'hku.png' ? 'rv-institution-hku' : undefined} src={`/assets/affiliations/${file}`} alt={AFFILIATIONS[index]} width="180" height="48" loading="eager" />)}</div></dd>
        <dt className="rv-content-label">Share</dt><dd><div className="rv-content-channels" aria-label="Project content">{CONTENT_CHANNELS.map(({ name, icon, href }) => {
          const Element = href ? 'a' : 'span';
          return <Element key={icon} className="rv-content-channel" href={href || undefined} target={href ? '_blank' : undefined} rel={href ? 'noopener noreferrer' : undefined}><img src={`/assets/content-platforms/${icon}.svg`} className={`rv-content-logo rv-content-logo--${icon}`} alt="" width="20" height="20" aria-hidden="true" />{name}</Element>;
        })}</div></dd>
      </dl>
      <div className="rv-paper-entries" aria-label="Project links">
        <div className="rv-release-grid">
          <ResourceEntry label="Report" icon="paper" external />
          <ResourceEntry label="Document" icon="book" href="/doc/" arrow />
          <ResourceEntry label="Code" logo="github" href="https://github.com/RoboValue-Benchmark/RoboValue" external />
          <ResourceEntry label="Dataset" icon="database" arrow arrowIcon="external" />
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
      <div className="rv-video-placeholder"><p>Video coming soon.</p></div>
    </div>
  </section>;
}

function Introduction() {
  return <section className="rv-introduction-section" id="overview" aria-label="RoboValue overview">
    <div className="rv-container rv-narrow">
      <div className="rv-introduction">
        <p className="rv-reveal">Robotic value models assess task execution from visual observations and language instructions. Their feedback supports data selection, policy learning, action planning, and execution monitoring, reducing the need for task-specific reward design. Errors in these judgments can propagate into both robot learning and execution, making systematic evaluation essential.</p>
        <p className="rv-reveal">Existing evaluations often emphasize task outcomes or correlation with forward progress. High scores can nevertheless hide incorrect intermediate judgments: values may rise during reverse playback, rebound after a failed recovery, or overlook completed subtasks when similar states recur. Such errors can reward unproductive behavior and misguide subsequent actions. A shared evaluation framework is therefore needed to reveal where value feedback succeeds or fails throughout an execution.</p>
        <ZoomableFigure className="rv-overview-figure rv-reveal" title="Overview of RoboValue" src="/assets/overview-10-13.svg" width="3200" height="3060" placeholder alt="Overview of RoboValue: simulation and real-world data, shared interfaces, resources, and diagnostic designs across four capability dimensions" caption="Overview of RoboValue: unified evaluation of robotic value models across four complementary dimensions in simulation and real-world settings." />
        <p className="rv-reveal">We introduce <strong className="rv-brand-name rv-brand-primary">RoboValue</strong>, a fine-grained sim-and-real benchmark for unified evaluation of robotic value models.</p>
        <p className="rv-reveal"><strong className="rv-brand-name">RoboValue-Dataset</strong> provides expert training demonstrations and annotated test trajectories across <strong className="rv-data-emphasis">15 simulation and 20 real-world manipulation tasks</strong>. Contrasts in task instructions, execution history, recovery outcomes, and valid subtask orders expose unreliable value judgments. Separate embodiment and environment shifts test generalization.</p>
        <p className="rv-reveal"><strong className="rv-brand-name">RoboValue-Benchmark</strong> evaluates four complementary capabilities: {GROUPS.map((group, index) => <React.Fragment key={group.id}>{index > 0 && (index === GROUPS.length - 1 ? ', and ' : ', ')}<strong className="rv-capability-name" style={{ '--capability-color': `var(--rv-capability-${group.id}, ${group.color})` }}>{group.title.toLowerCase()}</strong></React.Fragment>)}. Shared interfaces and model-specific adapters enable comparison across heterogeneous models while preserving their native value semantics.</p>
        <p className="rv-reveal">We establish <strong className="rv-brand-name">RoboValue-Leaderboard</strong> with separate overall rankings and capability profiles for three tracks: Zero-Shot, One-Shot, and Full-Shot. Current results cover the first two tracks; Full-Shot will open with the training dataset release. Our analyses distinguish instruction insensitivity from incorrect semantic grounding and reveal weaknesses in history awareness, recovery reasoning, and subtask credit. These findings inform future value supervision for policy learning, action planning, and execution monitoring.</p>
      </div>
    </div>
  </section>;
}

function News() {
  return <section className="rv-news-section" id="news" aria-labelledby="news-title">
    <div className="rv-container rv-narrow rv-reveal">
      <div className="rv-centered-heading"><h2 className="rv-eyebrow" id="news-title"><Icon name="paper" size={16} />NEWS</h2></div>
      <div className="rv-news-placeholder"><p>Updates coming soon.</p></div>
    </div>
  </section>;
}

function TaskTile({ item, condition }) {
  return <a className="rv-task-tile" href={taskPath(item)} data-task-id={item.id} aria-label={`${item.title}: ${CONDITIONS[condition]}. View task details.`}>
    <LoadingImage src={item.images[condition]} alt={`${item.title}: ${CONDITIONS[condition]}`} loading="lazy" width="640" height="480" />
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
      <div className="rv-centered-heading rv-reveal">{simulation && <p className="rv-eyebrow"><Icon name="database" size={16} />DATASET</p>}<h2 id={`${domain}-title`}>RoboValue {simulation ? 'Simulation' : 'Real-World'} Tasks</h2></div>
      <div className="rv-condition-controls rv-reveal">
        <button className="rv-condition-arrow" type="button" aria-label={`Previous ${name.toLowerCase()} condition`} aria-controls={galleryId} onClick={() => changeCondition(-1)}><Icon className="rv-previous" name="chevron" size={20} /></button>
        <div className="rv-condition-switch" role="group" aria-label={`${name} viewing condition`}>{Object.entries(CONDITIONS).map(([id, label]) => <button type="button" key={id} aria-pressed={condition === id} aria-controls={galleryId} onClick={() => setCondition(id)}>{label}</button>)}</div>
        <button className="rv-condition-arrow" type="button" aria-label={`Next ${name.toLowerCase()} condition`} aria-controls={galleryId} onClick={() => changeCondition(1)}><Icon name="chevron" size={20} /></button>
      </div>
      <div className="rv-gallery-viewport rv-reveal" id={galleryId} tabIndex={0} role="region" aria-label={`All ${items.length} ${name.toLowerCase()} tasks: ${CONDITIONS[condition]}`}><div className="rv-task-wall">{items.map(item => <TaskTile key={item.id} item={item} condition={condition} />)}</div></div>
      <div className="rv-suite-description rv-reveal">
        <p className="rv-task-context" aria-live="polite"><strong>{setting.robot}</strong><span className="rv-context-separator" aria-hidden="true">·</span><span>{setting.scene}</span></p>
        <a className="rv-text-link" href={`/doc/${domain}-tasks/catalog/`}>Explore All {items.length} {simulation ? 'Simulation' : 'Real-World'} Tasks<Icon size={20} /></a>
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
    <div className="rv-results-heading rv-reveal"><div className="rv-centered-heading"><p className="rv-eyebrow"><Icon name="trophy" size={16} />LEADERBOARD</p><h2 id="home-results-title">RoboValue Leaderboard</h2></div></div>
    <div className="rv-preview rv-reveal">
      <div className="rv-preview-top"><div className="rv-small-switch" role="group" aria-label="Homepage evaluation track">{Object.entries(TRACKS).map(([id, label]) => <button type="button" key={id} aria-pressed={track === id} aria-controls="home-results-table" onClick={() => setTrack(id)}>{label}</button>)}</div></div>
      <div className="rv-preview-frame"><div className="rv-preview-scroll" role="region" aria-label={`Homepage overall ranking, ${TRACKS[track]}`} tabIndex={0}><table className="rv-preview-table" id="home-results-table"><caption className="sr-only">All models in the {TRACKS[track]} track, ranked by Overall. Normalized capability scores range from 0 to 100; higher is better.</caption><thead><tr><th scope="col">Rank</th><th scope="col">Model</th><th scope="col" className="rv-preview-overall">Overall</th>{GROUPS.map(group => <th scope="col" key={group.id} className="rv-preview-capability" style={{ '--capability-color': colors[group.id] }} title={group.title}>{CAPABILITY_TABLE_HEADERS[group.id]}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td className="rv-rank">{row.aggregate.rank}</td><th scope="row"><RankingModel row={row} /></th><td className="rv-preview-overall">{renderScore(row.aggregate.overall, 'overall')}</td>{GROUPS.map(group => <td key={group.id}>{renderScore(row.aggregate[group.id], group.id)}</td>)}</tr>)}</tbody></table></div>{!rows.length && <div className="rv-preview-empty" role="status">{track === 'full' ? 'No results yet.' : error ? <><strong>Results could not be loaded.</strong><button type="button" className="rv-text-link" onClick={retry}>Try Again<Icon size={15} /></button></> : data ? 'No results yet.' : 'Loading results…'}</div>}</div>
      {!!rows.length && <div className="rv-preview-legend"><b>Best</b> · <span className="rv-score-second">Second Best</span></div>}
    </div>
    <nav className="rv-results-doc-links rv-reveal" aria-label="Detailed evaluation results"><a className="rv-text-link" href="/leaderboard/">View Detailed Results<Icon size={20} /></a></nav>
  </div></section>;
}

function EvaluationFramework() {
  return <section className="rv-section rv-framework" id="framework" aria-labelledby="framework-title"><div className="rv-container">
    <div className="rv-centered-heading rv-reveal">
      <p className="rv-eyebrow"><Icon name="leaderboard" size={16} />BENCHMARK</p>
      <h2 id="framework-title">Four Capability Dimensions</h2>
      <p className="rv-framework-intro">RoboValue tests whether models ground value judgments in task requirements, track progress and regression using execution history, localize failures and distinguish recovery outcomes, and provide stable feedback with consistent subtask credit.</p>
    </div>
    <div className="rv-dimension-grid">
      {GROUPS.map(group => <article className="rv-dimension rv-reveal" key={group.id} aria-labelledby={`framework-${group.id}`} style={{ '--dimension-color': `var(--rv-capability-${group.id})` }}>
        <h3 id={`framework-${group.id}`}>{group.title}</h3>
        <dl className="rv-dimension-metrics">
          {CAPABILITY_METRICS[group.id].map(([metric, capability]) => <div key={metric}><dt>{metric}</dt><dd>{capability}</dd></div>)}
        </dl>
      </article>)}
    </div>
    <div className="rv-framework-link rv-reveal"><a className="rv-text-link" href="https://robovalue-benchmark.github.io/doc/get-started/protocol/metrics/">Metrics<Icon size={20} /></a></div>
  </div></section>;
}

function Evaluation() {
  return <section className="rv-resources rv-evaluation" id="evaluation" aria-labelledby="evaluation-title">
    <div className="rv-container rv-narrow rv-reveal">
      <p className="rv-eyebrow"><Icon name="leaderboard" size={16} />EVALUATION</p>
      <h2 id="evaluation-title">Submit Your Model</h2>
      <p className="rv-evaluation-description">Submit your team and model details to request an evaluation.</p>
      <div className="rv-resource-links"><a className="rv-evaluation-action" href="/eval/">Request Evaluation<Icon size={18} /></a></div>
    </div>
  </section>;
}

function Community() {
  return <section className="rv-resources" id="community" aria-labelledby="community-title">
    <div className="rv-container rv-narrow rv-reveal">
      <p className="rv-eyebrow"><Icon name="conversation" size={16} />COMMUNITY</p>
      <h2 id="community-title">Join the RoboValue Community</h2>
      <p className="rv-community-description">Connect on WeChat and Discord to discuss the benchmark, evaluation, and robotic value models.</p>
      <div className="rv-resource-links"><a href="/community/#wechat">Join WeChat<Icon size={18} /></a><a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join Discord<Icon size={18} /></a></div>
    </div>
  </section>;
}

function Citation() {
  return <section className="rv-citation" id="citation" aria-labelledby="citation-title"><div className="rv-container rv-narrow rv-reveal"><div className="rv-centered-heading"><p className="rv-eyebrow"><Icon name="book" size={16} />CITATION</p><h2 id="citation-title">Cite Our Work</h2></div><div className="rv-citation-placeholder"><p>Citation details will be added when the public paper is released.</p></div></div></section>;
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
    <EvaluationFramework />
    <HomeResults />
    <Evaluation />
    <Community />
    <Citation />
    <footer className="rv-footer rv-container"><a href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" width="154" height="51" /></a><p>A benchmark for robotic value models.</p><nav aria-label="Footer"><a href="/doc/">Document</a><a href="/leaderboard/">Leaderboard</a><a href="/eval/">Evaluation</a><a href="/community/">Community</a></nav></footer>
  </main>;
}
