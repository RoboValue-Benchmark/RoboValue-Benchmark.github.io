import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { navigation, pages } from './navigation';
import { Figure, Icon, Protocol } from './benchmark';
import { Leaderboard } from './leaderboard';
import { TaskOverview, TaskCatalog, TaskDetail } from './tasks';
import './style.css';
import './docs.css';
import { PublicHome } from './home';
import './public-site.css';

function Home() {
  return <>
    <p className="home-title">A Fine-Grained Sim-and-Real Benchmark for Unified Evaluation of Robotic Value Models</p>
    <p className="review-tag">RoboValue Documentation</p>
    <div className="home-links"><button type="button" disabled title="Link to be added">Paper</button><button type="button" disabled title="Link to be added">arXiv</button><button type="button" disabled title="Link to be added">Code</button><button type="button" disabled title="Link to be added">Dataset</button><a href="/leaderboard/">Leaderboard <span>→</span></a><a href="/doc/get-started/">Get Started <span>→</span></a></div>
    <section className="home-narrative" aria-label="About RoboValue">
      <p>Robotic value models provide feedback for data curation, policy optimization, and execution monitoring. Yet accurate outcome predictions and strong progress correlation do not necessarily indicate reliable execution understanding. Values may increase despite task regression, rebound while errors remain unresolved, or fail to distinguish visually similar states with different execution histories.</p>
      <p><strong className="project-name">RoboValue</strong> is a unified sim-and-real benchmark for fine-grained evaluation of robotic value models. Shared interfaces and model-specific adapters enable comparisons across heterogeneous models while preserving their native value semantics. Evaluation covers four complementary dimensions: <strong>Task-State Understanding</strong>, <strong>Temporal Progress Monitoring</strong>, <strong>Failure and Recovery Reasoning</strong>, and <strong>Value Consistency</strong>.</p>
      <Figure src="/assets/benchmark-overview.svg" alt="RoboValue evaluation workflow: simulation and real-world trajectories, shared model interfaces, and four capability profiles" caption="RoboValue connects simulation and real-world trajectories with shared model interfaces to evaluate four complementary dimensions of execution understanding." />
      <p><strong className="project-name">RoboValue-Dataset</strong> contains expert training demonstrations and separate diagnostic test trajectories across simulation and real-world manipulation tasks. Beyond common successful and failed executions, diagnostic trajectories include incomplete subtasks, effective and ineffective recovery, visually similar states with different histories, and alternative valid action orders.</p>
      <div className="home-text-links"><a href="/doc/simulation-tasks/">Simulation tasks →</a><a href="/doc/real-world-tasks/">Real-world tasks →</a></div>
      <p>We evaluate robotic value models under zero-shot and one-shot settings, covering standard conditions and generalization across embodiment and environment shifts. One-shot evaluation uses one demonstration per task from the training split, separate from the test trajectories. The leaderboard presents results across capability dimensions to support comparisons of model strengths and limitations.</p>
      <div className="home-text-links"><a href="/leaderboard/">Leaderboard →</a><a href="/doc/get-started/">Get Started →</a></div>
    </section>
    <section className="home-citation" id="citation"><h2>Cite our work</h2><p>Citation details will be added when the publication link is available.</p></section>
  </>;
}

function SiteHeader({ menuOpen = false, setMenuOpen, documentation = false }) {
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(window.scrollY > 24);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !event.target.closest('.docs-header'))) setSiteMenuOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', close);
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('pointerdown', close); };
  }, []);
  const links = [['/', 'Home'], ['/leaderboard/', 'Leaderboard'], ['/doc/', 'Documentation'], ['/community/', 'Community']];
  const active = path => path === '/' ? window.location.pathname === '/' : window.location.pathname.startsWith(path);
  return <header className={`docs-header ${documentation ? '' : 'public-header'} ${scrolled ? 'is-scrolled' : ''}`}>
    <a className="docs-brand" href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" /></a>
    <nav className={`site-nav ${siteMenuOpen ? 'is-open' : ''}`} id="site-navigation" aria-label="Website">{links.map(([path, label]) => <a key={path} href={path} aria-current={active(path) ? 'page' : undefined}>{label}</a>)}</nav>
    <div className="header-mobile-controls">
      {documentation && <button className="menu-toggle" aria-label={menuOpen ? 'Close documentation navigation' : 'Open documentation navigation'} aria-expanded={menuOpen} aria-controls="docs-sidebar" onClick={() => { setSiteMenuOpen(false); setMenuOpen(!menuOpen); }}>{menuOpen ? 'Close' : 'Docs'}</button>}
      <button className="site-menu-toggle" aria-label={siteMenuOpen ? 'Close site navigation' : 'Open site navigation'} aria-expanded={siteMenuOpen} aria-controls="site-navigation" onClick={() => { setMenuOpen?.(false); setSiteMenuOpen(value => !value); }}>{siteMenuOpen ? 'Close' : 'Menu'}</button>
    </div>
  </header>;
}

function Landing() {
  return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><PublicHome /></div>;
}

function GetStarted() {
  return <><p className="doc-lead">Documentation for preparing RoboValue data, evaluating a value model, and understanding the reported metrics.</p><div className="doc-link-list">{pages.filter(p => p.group === 'Get Started' && p.kind !== 'start').map(p => <a key={p.path} href={p.path}>{p.title}<span>→</span></a>)}</div></>;
}

function DatasetGuide() {
  return <>
    <p className="doc-lead">RoboValue-Dataset covers simulation and real-world manipulation, with separate training and test splits.</p>
    <section className="task-section"><h2>Training split</h2><p>The training split provides expert demonstrations collected under standard in-domain conditions. It does not include subtask boundary annotations. Annotations constructed for model adaptation are separate from the benchmark’s test-set labels.</p></section>
    <section className="task-section"><h2>Test split</h2><p>The held-out test split covers standard conditions, embodiment shifts, and environment shifts. Diagnostic trajectories cover successful executions, failure and recovery, history-dependent progress, and alternative valid solutions. Manual annotations support subtask, failure, recovery-stage, and cross-solution evaluation.</p></section>
    <section className="task-section"><h2>Observations</h2><p>Trajectories include synchronized head- and wrist-camera RGB-D observations, together with robot states and action targets. Model-specific adapters select the observation context required by each evaluated model.</p></section>
    <section className="task-section"><h2>Evaluation settings</h2><p>Zero-shot evaluation uses released checkpoints without task-specific adaptation or reference demonstrations. One-shot evaluation selects one standard-scenario training demonstration per task for inference-time conditioning or task-specific adaptation.</p><p>A separate <strong>Full-Data Track is planned</strong> for training or fine-tuning on the full training split. It will use the held-out test trajectories and the same metrics, with rankings separate from zero-shot and one-shot evaluation.</p></section>
    <section className="task-section"><h2>Download and preparation</h2><p>Dataset download links and preparation instructions will be added when the release is available.</p></section>
    <div className="home-text-links"><a href="/doc/simulation-tasks/">Simulation tasks →</a><a href="/doc/real-world-tasks/">Real-world tasks →</a><a href="/doc/get-started/protocol/">Protocol and metrics →</a></div>
  </>;
}

function DocumentationNavigation({ path, page, query }) {
  const filter = query.toLowerCase().trim();
  const groups = navigation.map(group => ({ ...group, visible: group.pages.filter(p => `${group.title} ${p.path === '/doc/' ? 'Overview' : p.title}`.toLowerCase().includes(filter)) })).filter(group => group.visible.length);
  const link = p => <a key={p.path} href={p.path} className={`nav-page ${p.kind === 'task' ? 'nav-task' : ''}`} aria-current={p.path === path ? 'page' : undefined}>{p.path === '/doc/' ? 'Overview' : p.title}</a>;
  return <nav aria-label="Documentation">{groups.map(group => {
    if (group.pages.length === 1) return <div className="nav-single" key={group.title}>{group.visible.map(link)}</div>;
    const taskCount = group.pages.filter(p => p.kind === 'task').length;
    return <details key={`${group.title}-${!!filter}`} className="nav-group" open={!!filter || group.title === 'Get Started' || page?.group === group.title}>
      <summary><span>{group.title}</span></summary>
      <div>{group.visible.filter(p => p.kind !== 'task').map(link)}{group.visible.some(p => p.kind === 'task') && <div className="nav-task-list"><p className="nav-task-heading">Tasks <span className="nav-count">{taskCount}</span></p>{group.visible.filter(p => p.kind === 'task').map(link)}</div>}</div>
    </details>;
  })}{!groups.length && <p className="nav-empty">No matching pages.</p>}</nav>;
}

function App() {
  const path = window.location.pathname.replace(/\/?$/, '/');
  const page = pages.find(p => p.path === path);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    document.title = page?.kind === 'landing' ? 'RoboValue — Fine-Grained Evaluation of Robotic Value Models' : `${page?.kind === 'home' ? 'Documentation' : page?.title ?? 'Page not found'} | RoboValue`;
    const close = e => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    // Native anchors also work when a linked heading is inside a collapsed metric.
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) { if (target.tagName === 'DETAILS') target.open = true; target.scrollIntoView(); }
    return () => window.removeEventListener('keydown', close);
  }, [page]);
  const index = pages.indexOf(page);
  const title = page?.kind === 'simulation' ? 'Simulation Tasks' : page?.kind === 'real' ? 'Real-World Tasks' : page?.title;
  let content = null;
  switch (page?.kind) {
    case 'home': content = <Home />; break;
    case 'start': content = <GetStarted />; break;
    case 'data': content = <DatasetGuide />; break;
    case 'simulation': content = <TaskOverview domain="simulation" />; break;
    case 'real': content = <TaskOverview domain="real-world" />; break;
    case 'catalog': content = <TaskCatalog domain={page.domain} />; break;
    case 'task': content = <TaskDetail taskId={page.taskId} />; break;
    case 'protocol': content = <Protocol />; break;
    case 'community': content = <><p className="doc-lead">Join the RoboValue WeChat group to discuss the benchmark, evaluation, and robotic value models.</p><section className="community-section"><h2>WeChat group</h2><p>Scan the QR code below with WeChat to join.</p><a href="/assets/community-wechat.png" target="_blank" rel="noopener noreferrer" aria-label="Open the original WeChat group QR image"><img className="community-qr" src="/assets/community-wechat.png" alt="RoboValue WeChat group invitation QR code, valid until October 14" width="540" height="830" /></a><p className="community-validity">This invitation is valid until October 14. Click the image to view it at its original size.</p></section></>; break;
  }
  if (page?.kind === 'landing') return <Landing />;
  if (page?.kind === 'leaderboard') return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><Leaderboard /></div>;
  return <div className="docs-app">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} documentation />
    {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`docs-sidebar ${menuOpen ? 'is-open' : ''}`} id="docs-sidebar"><label className="nav-filter"><Icon name="search" size={16} /><input type="search" placeholder="Find a page…" aria-label="Filter navigation" value={query} onChange={e => setQuery(e.target.value)} /></label><DocumentationNavigation path={path} page={page} query={query} /></aside>
    <div className={`docs-layout ${page?.kind === 'leaderboard' ? 'full-width' : ''} no-outline`}>
      <main className="doc-main" id="main-content" tabIndex={-1}><div className="doc-breadcrumb"><a href="/doc/">RoboValue</a><span>/</span><span>{page?.group ?? 'Not found'}</span></div><h1>{title ?? 'Page not found'}</h1>{!page ? <p>This page does not exist. <a className="inline-link" href="/">Return to Home.</a></p> : content}
        {page && <nav className="page-pagination" aria-label="Adjacent pages">{index > 0 ? <a href={pages[index-1].path}><span>← Previous</span>{pages[index-1].group} / {pages[index-1].title}</a> : <div />}{index < pages.length-1 && <a href={pages[index+1].path}><span>Next →</span>{pages[index+1].group} / {pages[index+1].title}</a>}</nav>}
        <div className="doc-footer">RoboValue · RoboValue Documentation</div>
      </main>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
