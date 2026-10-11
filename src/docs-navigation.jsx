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

function PageLink({ entry, path, taskNumber }) {
  return <a href={entry.path} className={`nav-page ${entry.kind === 'task' ? 'nav-task' : ''}`} data-capability={entry.dimension} aria-current={entry.path === path ? 'page' : undefined}>
    {taskNumber != null ? <><span className="nav-task-number" aria-hidden="true">{String(taskNumber).padStart(2, '0')}</span><span className="nav-task-title">{entry.title}</span></> : entry.path === '/doc/' ? 'Overview' : entry.title}
  </a>;
}

function PageTree({ entries, path, filter, activePaths }) {
  return entries.map(entry => entry.children ? <details key={`${entry.path ?? entry.title}-${!!filter}`} className="nav-group nav-branch" open={!!filter || activePaths.has(entry.path) || entry.children.some(child => activePaths.has(child.path))}>
    <summary><span>{entry.path ? <a href={entry.path} data-capability={entry.dimension} aria-current={entry.path === path ? 'page' : undefined}>{entry.title}</a> : entry.title}</span></summary>
    <div className="nav-subpages"><PageTree entries={entry.children} path={path} filter={filter} activePaths={activePaths} /></div>
  </details> : <PageLink key={entry.path} entry={entry} path={path} />);
}

function TaskNavigation({ group, path, page, filter, activePaths }) {
  const allTasks = group.pages.filter(entry => entry.kind === 'task');
  const visibleTasks = group.visible.filter(entry => entry.kind === 'task');
  return <details className="nav-group nav-task-group" open={!!filter || page?.group === group.title}>
    <summary><span>{group.title}</span><span className="nav-task-count" aria-label={`${allTasks.length} tasks`}>{allTasks.length}</span></summary>
    <div className="nav-task-content">
      <div className="nav-task-shortcuts"><PageTree entries={group.visible.filter(entry => entry.kind !== 'task')} path={path} filter={filter} activePaths={activePaths} /></div>
      {visibleTasks.length > 0 && <ol className="nav-task-items" aria-label={group.title}>{visibleTasks.map(entry => <li key={entry.path}>
        <PageLink entry={entry} path={path} taskNumber={allTasks.findIndex(task => task.path === entry.path) + 1} />
      </li>)}</ol>}
    </div>
  </details>;
}

export function DocumentationNavigation({ path, page, query }) {
  const filter = query.toLowerCase().trim();
  const activePaths = new Set();
  for (let current = page; current; current = current.parent) activePaths.add(current.path);
  const groups = navigation.map(group => ({ ...group, visible: filteredPages(group.pages, filter, group.title) })).filter(group => group.visible.length);
  return <nav aria-label="Documentation">{groups.map(group => {
    if (group.pages.length === 1) return <div className="nav-single" key={group.title}><PageTree entries={group.visible} path={path} filter={filter} activePaths={activePaths} /></div>;
    if (group.pages.some(entry => entry.kind === 'task')) return <TaskNavigation key={`${group.title}-${!!filter}`} group={group} path={path} page={page} filter={filter} activePaths={activePaths} />;
    return <details key={`${group.title}-${!!filter}`} className="nav-group" open={!!filter || group.title === 'Usage' || page?.group === group.title}>
      <summary><span>{group.title}</span></summary>
      <div><PageTree entries={group.visible} path={path} filter={filter} activePaths={activePaths} /></div>
    </details>;
  })}{!groups.length && <p className="nav-empty">No matching pages.</p>}</nav>;
}
