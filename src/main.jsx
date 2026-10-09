import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { documentationPages, navigation, pages } from './navigation';
import { Icon } from './benchmark';
import { Leaderboard } from './leaderboard';
import { TaskOverview, TaskCatalog, TaskDetail } from './tasks';
import './style.css';
import './docs.css';
import './docs-theme.css';
import { ModelAPI, apiSections } from './docs-api';
import { PublicHome } from './home';
import './public-site.css';
import { DocumentationOverview, GetStarted, DatasetOverview, EvaluationWorkflow, SubmitModel, ProtocolGuide, PageOutline, documentationSections } from './docs-content';

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
  const links = [
    ['/', 'Home'],
    ['/doc/', 'Document'],
    ['/leaderboard/', 'Leaderboard'],
    ['/data/', 'Data'],
    ['https://github.com/RoboValue-Benchmark/RoboValue', 'Code'],
    ['/community/', 'Community'],
  ];
  const currentPath = window.location.pathname.replace(/\/?$/, '/');
  const active = path => path === '/' ? currentPath === '/' : currentPath.startsWith(path);
  return <header className={`docs-header ${documentation ? '' : 'public-header'} ${scrolled ? 'is-scrolled' : ''}`}>
    <a className="docs-brand" href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" /></a>
    <nav className={`site-nav ${siteMenuOpen ? 'is-open' : ''}`} id="site-navigation" aria-label="Website">{links.map(([path, label]) => <a key={label} href={path} aria-current={active(path) ? 'page' : undefined} target={path.startsWith('https://') ? '_blank' : undefined} rel={path.startsWith('https://') ? 'noopener noreferrer' : undefined}>{label}</a>)}</nav>
    <div className="header-mobile-controls">
      {documentation && <button className="menu-toggle" aria-label={menuOpen ? 'Close documentation navigation' : 'Open documentation navigation'} aria-expanded={menuOpen} aria-controls="docs-sidebar" onClick={() => { setSiteMenuOpen(false); setMenuOpen(!menuOpen); }}>{menuOpen ? 'Close' : 'Docs'}</button>}
      <button className="site-menu-toggle" aria-label={siteMenuOpen ? 'Close site navigation' : 'Open site navigation'} aria-expanded={siteMenuOpen} aria-controls="site-navigation" onClick={() => { setMenuOpen?.(false); setSiteMenuOpen(value => !value); }}>{siteMenuOpen ? 'Close' : 'Menu'}</button>
    </div>
  </header>;
}

function Landing() {
  return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><PublicHome /></div>;
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
  const index = documentationPages.indexOf(page);
  const title = page?.kind === 'simulation' ? 'Simulation Tasks' : page?.kind === 'real' ? 'Real-World Tasks' : page?.title;
  const outline = page?.kind === 'api' ? apiSections : documentationSections[page?.kind];
  let content = null;
  switch (page?.kind) {
    case 'home': content = <DocumentationOverview />; break;
    case 'start': content = <GetStarted />; break;
    case 'data': content = <DatasetOverview />; break;
    case 'evaluation': content = <EvaluationWorkflow />; break;
    case 'submission': content = <SubmitModel />; break;
    case 'api': content = <ModelAPI />; break;
    case 'simulation': content = <TaskOverview domain="simulation" />; break;
    case 'real': content = <TaskOverview domain="real-world" />; break;
    case 'catalog': content = <TaskCatalog domain={page.domain} />; break;
    case 'task': content = <TaskDetail taskId={page.taskId} />; break;
    case 'protocol': content = <ProtocolGuide />; break;
    case 'community': break;
  }
  if (page?.kind === 'landing') return <Landing />;
  if (page?.kind === 'data-release') return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><main className="public-data-page" id="main-content" tabIndex={-1}><h1>Data</h1><p>Coming soon.</p></main></div>;
  if (page?.kind === 'leaderboard') return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><Leaderboard /></div>;
  return <div className="docs-app docs-workspace">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} documentation />
    {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`docs-sidebar ${menuOpen ? 'is-open' : ''}`} id="docs-sidebar"><div className="docs-sidebar-label">Documentation <span>RoboValue</span></div><label className="nav-filter"><Icon name="search" size={16} /><input type="search" placeholder="Find a page…" aria-label="Filter navigation" value={query} onChange={e => setQuery(e.target.value)} /></label><DocumentationNavigation path={path} page={page} query={query} /><a className="docs-source-link" href="https://github.com/RoboValue-Benchmark/RoboValue">View code on GitHub <Icon name="arrow" size={15} /></a></aside>
    <div className={`docs-layout ${outline ? 'has-outline' : 'no-outline'}`}>
      <main className="doc-main" id="main-content" tabIndex={-1}><div className="doc-breadcrumb"><a href="/doc/">RoboValue</a><span>/</span><span>{page?.group ?? 'Not found'}</span></div><h1>{title ?? 'Page not found'}</h1>{!page ? <p>This page does not exist. <a className="inline-link" href="/">Return to Home.</a></p> : content}
        {index >= 0 && <nav className="page-pagination" aria-label="Adjacent pages">{index > 0 ? <a href={documentationPages[index-1].path}><span>← Previous</span>{documentationPages[index-1].group} / {documentationPages[index-1].title}</a> : <div />}{index < documentationPages.length-1 && <a href={documentationPages[index+1].path}><span>Next →</span>{documentationPages[index+1].group} / {documentationPages[index+1].title}</a>}</nav>}
        <div className="doc-footer">RoboValue · RoboValue Documentation</div>
      </main>
      {outline && <PageOutline sections={outline} />}
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
