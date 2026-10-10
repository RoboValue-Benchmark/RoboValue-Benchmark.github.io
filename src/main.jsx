import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { documentationPages, pages } from './navigation';
import { DocumentationNavigation } from './docs-navigation';
import { Icon } from './benchmark';
import { Leaderboard } from './leaderboard';
import { TaskOverview, TaskCatalog, TaskDetail } from './tasks';
import './style.css';
import './docs.css';
import './docs-theme.css';
import { ServiceAdapter, adapterSections } from './docs-adapter';
import { PublicHome } from './home';
import './public-site.css';
import './reading-theme.css';
import { DocumentationOverview, GetStarted, DatasetOverview, DatasetDownload, EvaluationWorkflow, EvaluationResults, SubmitModel, PageOutline, documentationSections } from './docs-content';
import { ProtocolGuide, EvaluationProtocol, MetricsReference, MetricGuide, protocolSections } from './docs-protocol';
import { DiagnosticTrajectories, DiagnosticCategory, diagnosticSections } from './docs-diagnostics';

function SiteHeader({ menuOpen = false, setMenuOpen, documentation = false, sidebarCollapsed = false, onToggleSidebar }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('robovalue-theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('robovalue-theme', theme);
  }, [theme]);
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
    ['/eval/', 'Eval'],
    ['/community/', 'Community'],
  ];
  const currentPath = window.location.pathname.replace(/\/?$/, '/');
  const active = path => path === '/' ? currentPath === '/' : currentPath.startsWith(path);
  return <header className={`docs-header public-header ${documentation ? 'documentation-header' : ''} ${currentPath === '/' ? 'public-header--home' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
    <a className="docs-brand" href="/" aria-label="RoboValue home"><img src="/assets/robovalue-logo.png" alt="RoboValue" /></a>
    <nav className={`site-nav ${siteMenuOpen ? 'is-open' : ''}`} id="site-navigation" aria-label="Website">{links.map(([path, label]) => <a key={label} href={path} aria-current={active(path) ? 'page' : undefined} target={path.startsWith('https://') ? '_blank' : undefined} rel={path.startsWith('https://') ? 'noopener noreferrer' : undefined}>{label}</a>)}</nav>
    {documentation && <button className="sidebar-toggle" aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'} title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'} aria-expanded={!sidebarCollapsed} aria-controls="docs-sidebar" onClick={onToggleSidebar}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d={sidebarCollapsed ? 'm12 9 3 3-3 3' : 'm15 9-3 3 3 3'} /></svg>
    </button>}
    <button className="theme-toggle" aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title={theme === 'light' ? 'Dark mode' : 'Light mode'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{theme === 'light' ? <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}</svg>
    </button>
    <div className="header-mobile-controls">
      {documentation && <button className="menu-toggle" aria-label={menuOpen ? 'Close documentation navigation' : 'Open documentation navigation'} aria-expanded={menuOpen} aria-controls="docs-sidebar" onClick={() => { setSiteMenuOpen(false); setMenuOpen(!menuOpen); }}>{menuOpen ? 'Close' : 'Docs'}</button>}
      <button className="site-menu-toggle" aria-label={siteMenuOpen ? 'Close site navigation' : 'Open site navigation'} aria-expanded={siteMenuOpen} aria-controls="site-navigation" onClick={() => { setMenuOpen?.(false); setSiteMenuOpen(value => !value); }}>{siteMenuOpen ? 'Close' : 'Menu'}</button>
    </div>
  </header>;
}

function Landing() {
  return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><PublicHome /></div>;
}


function App() {
  const path = window.location.pathname.replace(/\/?$/, '/');
  const page = pages.find(p => p.path === path);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('robovalue-sidebar') === 'collapsed');
  useEffect(() => {
    localStorage.setItem('robovalue-sidebar', sidebarCollapsed ? 'collapsed' : 'expanded');
  }, [sidebarCollapsed]);
  useEffect(() => {
    if (!['protocol', 'metrics', 'diagnostics', 'data', 'data-download'].includes(page?.kind)) return;
    const followAnchor = () => {
      const child = documentationPages.find(candidate => candidate.path !== page.path && candidate.anchors?.includes(window.location.hash.slice(1)));
      if (child) window.location.replace(child.kind === 'diagnostic-category' ? child.path : `${child.path}${window.location.hash}`);
    };
    followAnchor();
    window.addEventListener('hashchange', followAnchor);
    return () => window.removeEventListener('hashchange', followAnchor);
  }, [page]);
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
  const outline = page?.kind === 'integration' ? adapterSections : page?.kind === 'diagnostics' ? undefined : page?.kind === 'diagnostic-category' ? diagnosticSections : protocolSections[page?.kind] ?? documentationSections[page?.kind];
  let content = null;
  switch (page?.kind) {
    case 'home': content = <DocumentationOverview />; break;
    case 'start': content = <GetStarted />; break;
    case 'data': content = <DatasetOverview />; break;
    case 'data-download': content = <DatasetDownload />; break;
    case 'evaluation': content = <EvaluationWorkflow />; break;
    case 'evaluation-results': content = <EvaluationResults />; break;
    case 'submission': content = <SubmitModel />; break;
    case 'integration': content = <ServiceAdapter />; break;
    case 'simulation': content = <TaskOverview domain="simulation" />; break;
    case 'real': content = <TaskOverview domain="real-world" />; break;
    case 'catalog': content = <TaskCatalog domain={page.domain} />; break;
    case 'task': content = <TaskDetail taskId={page.taskId} />; break;
    case 'diagnostics': content = <DiagnosticTrajectories />; break;
    case 'diagnostic-category': content = <DiagnosticCategory category={page.category} />; break;
    case 'protocol': content = <ProtocolGuide />; break;
    case 'evaluation-protocol': content = <EvaluationProtocol />; break;
    case 'metrics': content = <MetricsReference />; break;
    case 'metric': content = <MetricGuide metricKey={page.metricKey} />; break;
    case 'community':
      content = <section className="community-section" aria-labelledby="wechat-title">
        <h2 id="wechat-title">Join the WeChat group</h2>
        <p>Scan the QR code with WeChat to join the RoboValue discussion group.</p>
        <img className="community-qr" src="/assets/community-wechat.png" alt="QR code for the RoboValue WeChat discussion group" width="540" height="830" />
      </section>;
      break;
  }
  if (page?.kind === 'landing') return <Landing />;
  if (page?.kind === 'evaluation-page') return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><main className="public-eval-page" id="main-content" tabIndex={-1}><h1>Eval</h1></main></div>;
  if (page?.kind === 'data-release') return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><main className="public-data-page" id="main-content" tabIndex={-1}><h1>Data</h1><p>Coming soon.</p></main></div>;
  if (page?.kind === 'leaderboard') return <div className="docs-app"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><Leaderboard /></div>;
  return <div className={`docs-app docs-workspace ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} documentation sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
    {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`docs-sidebar ${menuOpen ? 'is-open' : ''}`} id="docs-sidebar"><div className="docs-sidebar-label">Documentation</div><label className="nav-filter"><Icon name="search" size={16} /><input type="search" placeholder="Find a page…" aria-label="Filter navigation" value={query} onChange={e => setQuery(e.target.value)} /></label><DocumentationNavigation path={path} page={page} query={query} /></aside>
    <div className={`docs-layout ${outline ? 'has-outline' : 'no-outline'}`}>
      <main className="doc-main" id="main-content" tabIndex={-1}>{page?.kind !== 'home' && <h1>{title ?? 'Page not found'}</h1>}{!page ? <p>This page does not exist. <a className="inline-link" href="/">Return to Home.</a></p> : content}
        {index >= 0 && <nav className="page-pagination" aria-label="Adjacent pages">{index > 0 ? <a href={documentationPages[index-1].path}><span>← Previous</span>{documentationPages[index-1].group !== documentationPages[index-1].title && `${documentationPages[index-1].group} / `}{documentationPages[index-1].title}</a> : <div />}{index < documentationPages.length-1 && <a href={documentationPages[index+1].path}><span>Next →</span>{documentationPages[index+1].group !== documentationPages[index+1].title && `${documentationPages[index+1].group} / `}{documentationPages[index+1].title}</a>}</nav>}
      </main>
      {outline && <PageOutline sections={outline} />}
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
