import React from 'react';
import { navigation } from './navigation';

function filteredPages(entries, filter, groupTitle) {
  return entries.flatMap(entry => {
    const title = entry.path === '/doc/' ? 'Overview' : entry.title;
    if (`${groupTitle} ${title}`.toLowerCase().includes(filter)) return [entry];
    const children = entry.children && filteredPages(entry.children, filter, groupTitle);
    return children?.length ? [{ ...entry, children }] : [];
  });
}

function PageLink({ entry, path }) {
  return <a href={entry.path} className={`nav-page ${entry.kind === 'task' ? 'nav-task' : ''}`} aria-current={entry.path === path ? 'page' : undefined}>{entry.path === '/doc/' ? 'Overview' : entry.title}</a>;
}

function PageTree({ entries, path, filter, activePaths }) {
  return entries.map(entry => entry.children ? <details key={`${entry.path ?? entry.title}-${!!filter}`} className="nav-group nav-branch" open={!!filter || activePaths.has(entry.path) || entry.children.some(child => activePaths.has(child.path))}>
    <summary><span>{entry.path ? <a href={entry.path} aria-current={entry.path === path ? 'page' : undefined}>{entry.title}</a> : entry.title}</span></summary>
    <div className="nav-subpages"><PageTree entries={entry.children} path={path} filter={filter} activePaths={activePaths} /></div>
  </details> : <PageLink key={entry.path} entry={entry} path={path} />);
}

export function DocumentationNavigation({ path, page, query }) {
  const filter = query.toLowerCase().trim();
  const activePaths = new Set();
  for (let current = page; current; current = current.parent) activePaths.add(current.path);
  const groups = navigation.map(group => ({ ...group, visible: filteredPages(group.pages, filter, group.title) })).filter(group => group.visible.length);
  return <nav aria-label="Documentation">{groups.map(group => {
    if (group.pages.length === 1) return <div className="nav-single" key={group.title}><PageTree entries={group.visible} path={path} filter={filter} activePaths={activePaths} /></div>;
    const tasks = group.visible.filter(entry => entry.kind === 'task');
    const taskCount = group.pages.filter(entry => entry.kind === 'task').length;
    return <details key={`${group.title}-${!!filter}`} className="nav-group" open={!!filter || group.title === 'Usage' || page?.group === group.title}>
      <summary><span>{group.title}</span></summary>
      <div><PageTree entries={group.visible.filter(entry => entry.kind !== 'task')} path={path} filter={filter} activePaths={activePaths} />{tasks.length > 0 && <div className="nav-task-list"><p className="nav-task-heading">Tasks <span className="nav-count">{taskCount}</span></p><PageTree entries={tasks} path={path} filter={filter} activePaths={activePaths} /></div>}</div>
    </details>;
  })}{!groups.length && <p className="nav-empty">No matching pages.</p>}</nav>;
}
