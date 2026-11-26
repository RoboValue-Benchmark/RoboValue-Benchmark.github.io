import { createPortal } from 'react-dom';
import { SettingFilter } from './setting-filter';
import { SettingBadge, SettingsSummary } from './evaluation-setting';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './benchmark';
import { GROUPS, CAPABILITY_TABLE_HEADERS, METRICS as BASE_METRICS, CONDITIONS, excludedHighlight, scoreValue } from './benchmark-metrics';
import { TRACKS, metricGroups as publishedMetricGroups, resultsCSV, scoreHighlights, sortedRows, unifiedRanking } from './leaderboard-utils';
import { RankingModel } from './ranking-model';
import subtaskData from './data/subtask-results.json';
import { useResults } from './use-results';
import './leaderboard.css';
import { readLeaderboardViews, leaderboardViewsURL } from './leaderboard-state.mjs';

// Local presentation keeps the other pages unchanged.
const COLORS = { understanding: '#366c9a', tracking: '#447d64', diagnosis: '#a56f2d', consistency: '#a45368' };
const METRICS = { ...BASE_METRICS, sia: { label: 'SIA', name: 'Subtask Identification Accuracy' } };
const metricGroups = condition => publishedMetricGroups(condition).map(group =>
  group.id === 'understanding' ? { ...group, metrics: [...group.metrics, 'sia'] } : group
);
const format = value => value == null ? '—' : value.toFixed(2);
const VIEW_COLUMNS = {
  rankingKeys: metricGroups('aggregate').flatMap(group => group.metrics),
  resultKeys: Object.fromEntries(['id', 'emb', 'env'].map(condition => [condition, metricGroups(condition).flatMap(group => group.metrics)])),
};
const capabilityFor = key => GROUPS.find(group => group.id === key || group.metrics.includes(key) || key === 'sia' && group.id === 'understanding');

function mergeSubtaskResults(rows) {
  const keyFor = row => `${row.setting}:${row.name}:${Boolean(row.preview)}`;
  const remaining = new Map(subtaskData.rows.map(row => [keyFor(row), row]));
  const merged = rows.map(row => {
    const subtask = remaining.get(keyFor(row));
    if (!subtask) return row;
    remaining.delete(keyFor(row));
    return { ...row, conditions: { ...row.conditions, ...Object.fromEntries(Object.entries(subtask.conditions).map(([condition, sia]) =>
      [condition, { ...row.conditions?.[condition], sia: row.conditions?.[condition]?.sia ?? sia }]
    )) } };
  });
  for (const subtask of remaining.values()) {
    const nextModel = merged.findIndex(row => row.name.localeCompare(subtask.name, 'en') > 0);
    merged.splice(nextModel < 0 ? merged.length : nextModel, 0, {
      id: `${subtask.name.toLowerCase()}-${subtask.setting}-sia`, name: subtask.name,
      setting: subtask.setting,
      conditions: Object.fromEntries(Object.entries(subtask.conditions).map(([condition, sia]) => [condition, { sia }])),
    });
  }
  return merged.map((row, order) => ({ ...row, order }));
}

function saveCSV(csv, filename) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


function Score({ value, highlight, excluded, overall = false }) {
  const mark = value == null || excluded ? '' : value === highlight?.best ? 'lb-best' : value === highlight?.second ? 'lb-second' : '';
  return <span className={`lb-value ${mark} ${overall ? 'lb-overall-value' : ''}`} title={excluded ? 'Excluded from best and second-best highlighting, following the manuscript' : undefined}>
    {format(value)}
  </span>;
}

function SortHint({ metric, reset = false }) {
  return <>Click <span className="lb-sort-header-label">column header</span> to <strong>SORT BY</strong> {reset ? 'Overall Rank' : metric === 'overall' ? 'Overall' : METRICS[metric].name}</>;
}

export function ResultsTable({ eligible, view, loading, error, retry, tableId, onSort, onReset, setting, onSettingChange, counts, highlightRows }) {
  const tableRef = useRef(null);
  useEffect(() => {
    if (view.condition === 'aggregate') return;
    const table = tableRef.current;
    const modelHeader = table.querySelector('thead .lb-model');
    const updateOffset = () => table.style.setProperty('--lb-model-offset', `${modelHeader.getBoundingClientRect().width}px`);
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(modelHeader);
    return () => observer.disconnect();
  }, [view.condition]);
  const [cellHint, setCellHint] = useState(null);
  useEffect(() => {
    if (!cellHint) return;
    const clear = () => setCellHint(null);
    const escape = event => { if (event.key === 'Escape') clear(); };
    window.addEventListener('scroll', clear, true);
    window.addEventListener('resize', clear);
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('scroll', clear, true); window.removeEventListener('resize', clear); window.removeEventListener('keydown', escape); };
  }, [!!cellHint]);
  const showCellHint = event => {
    const cell = event.target.closest('td[data-metric]');
    if (!cell || event.pointerType === 'touch') { setCellHint(null); return; }
    setCellHint({ key: cell.dataset.metric, left: Math.max(8, Math.min(event.clientX + 12, window.innerWidth - 228)), top: Math.max(8, Math.min(event.clientY + 18, window.innerHeight - 76)) });
  };
  const showHeaderHint = event => {
    if (event.pointerType === 'touch') return;
    const header = event.currentTarget;
    const rect = header.getBoundingClientRect();
    setCellHint({ key: header.dataset.metric, left: Math.max(8, Math.min(rect.left + rect.width / 2 - 110, window.innerWidth - 228)), top: Math.max(8, Math.min(rect.bottom - 4, window.innerHeight - 92)) });
  };
  const groups = metricGroups(view.condition);
  const columns = groups.flatMap(group => group.metrics);
  const rows = useMemo(() => sortedRows(eligible, view), [eligible, view]);
  const highlights = scoreHighlights(highlightRows, view.condition, columns, METRICS);
  const ranked = view.condition === 'aggregate';
  const selectedColumn = view.sort?.key || (ranked ? 'overall' : null);
  const metricHeader = key => {
    const capability = capabilityFor(key);
    const label = ranked && capability ? CAPABILITY_TABLE_HEADERS[capability.id] : METRICS[key].label;
    const ascending = view.sort?.key === key && view.sort.asc;
    const selected = ranked ? selectedColumn === key : view.sort?.key === key;
    return <th key={key} scope="col" data-metric={key} onPointerEnter={showHeaderHint} onPointerLeave={() => setCellHint(null)} onFocus={showHeaderHint} onBlur={() => setCellHint(null)} className={`lb-ranking-metric${selected ? ' lb-selected-column' : ''}`} aria-sort={selected ? ranked ? 'descending' : ascending ? 'ascending' : 'descending' : 'none'} style={{ '--capability-color': COLORS[capability?.id] }}>
      <button className="lb-sort-button" onClick={() => onSort(key)} disabled={!rows.length} aria-describedby={`${tableId}-sort-${key}`}>
        <span className={ranked && capability ? 'lb-capability-heading' : undefined}>{label}</span><span className="lb-direction lb-ranking-direction" aria-hidden="true"><svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true"><path d={METRICS[key].lower ? 'M6 2v9m-3-3 3 3 3-3' : 'M6 12V3m-3 3 3-3 3 3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </button>
      <span className="sr-only" id={`${tableId}-sort-${key}`}><SortHint metric={key} reset={!ranked && selected} /></span>
    </th>;
  };
  return <>
      <div className="lb-table-frame"><div className="lb-table-scroll" tabIndex={0} role="region" aria-label={`${CONDITIONS[view.condition]} results, ${setting === 'all' ? 'all settings' : TRACKS[setting]}`}>
        <table ref={tableRef} id={tableId} className={`lb-table ${ranked ? 'lb-table-aggregate' : 'lb-table-metrics'}`}>
          <caption className="sr-only">{CONDITIONS[view.condition]}, {setting === 'all' ? 'all settings' : TRACKS[setting]}. {ranked ? 'Published capability scores; higher is better. Default order compares all settings by Overall.' : 'Raw metric scores ×100. FPL: lower is better; other metrics: higher is better. SIA does not contribute to Overall. Dashes indicate unreported metrics.'}</caption>
          <thead>{ranked ? <tr><th scope="col" className="lb-model">Model</th><th scope="col" className="lb-setting"><SettingFilter value={setting} onChange={onSettingChange} counts={counts} tableId={tableId} /></th>{columns.map(metricHeader)}</tr> : <>
            <tr className="lb-group-row"><th rowSpan={2} scope="col" className="lb-model">Model</th><th rowSpan={2} scope="col" className="lb-setting"><SettingFilter value={setting} onChange={onSettingChange} counts={counts} tableId={tableId} /></th>{groups.map(group => <th key={group.id} colSpan={group.metrics.length} scope="colgroup" style={{ '--capability-color': COLORS[group.id] }}>{group.title}</th>)}</tr>
            <tr className="lb-metric-row">{columns.map(metricHeader)}</tr>
          </>}</thead>
          <tbody onPointerMove={showCellHint} onPointerLeave={() => setCellHint(null)} onPointerDown={() => setCellHint(null)}>{rows.map(row => <tr key={row.id}>
            <th scope="row" className="lb-model"><RankingModel row={row} /></th>
            <td className="lb-setting"><SettingBadge setting={row.setting} /></td>
            {columns.map(key => <td key={key} data-metric={key} className={selectedColumn === key ? 'lb-selected-column' : ''}><Score value={scoreValue(row, view.condition, key)} highlight={highlights[key]} excluded={excludedHighlight(row, key)} overall={key === 'overall'} /></td>)}
          </tr>)}</tbody>
        </table>
      </div>{!rows.length && <div className="lb-empty" role="status">{error ? <>Results could not be loaded. <button onClick={retry}>Try Again</button></> : loading ? 'Loading results…' : 'No results yet.'}</div>}</div>
      {cellHint && createPortal(<span key={cellHint.key} className="lb-cell-sort-tooltip" role="tooltip" style={{ left: cellHint.left, top: cellHint.top }}><SortHint metric={cellHint.key} reset={!ranked && selectedColumn === cellHint.key} /></span>, document.body)}
      {!!rows.length && <div className="lb-table-legend"><span><b>Best</b> · <span className="lb-second">Second Best</span></span>{view.sort && <button onClick={onReset}>Reset {ranked ? 'Ranking' : 'Order'}</button>}</div>}
  </>;
}

function DownloadResults({ eligible, view }) {
  const columns = metricGroups(view.condition).flatMap(group => group.metrics);
  return <button className="lb-download" aria-label={`Download ${view.track === 'all' ? 'all settings' : TRACKS[view.track]} ${CONDITIONS[view.condition]} results as CSV`} disabled={!eligible.length} onClick={() => saveCSV(resultsCSV(sortedRows(eligible, view), view, columns, METRICS, TRACKS), `robovalue-${view.track === 'all' ? 'all-settings' : view.track}-${view.condition}-results.csv`)}><Icon name="down" size={15} />CSV</button>;
}

function UnifiedTable({ kind, allRows, loading, error, retry, state, onChange, setting, onSettingChange }) {
  const ranked = kind === 'ranking';
  const { condition = 'id', sort } = state;
  const eligible = setting === 'all' ? allRows : allRows.filter(row => row.setting === setting);
  const counts = { all: allRows.length, ...Object.fromEntries(Object.keys(TRACKS).map(key => [key, allRows.filter(row => row.setting === key).length])) };
  const view = { track: setting, condition: ranked ? 'aggregate' : condition, sort, query: '', capability: 'all', selected: [] };
  const tableId = `lb-${kind}-table`;
  return <section className="lb-track-section" data-kind={kind} aria-label={`${ranked ? 'Overall Ranking' : 'Results'}, ${setting === 'all' ? 'all settings' : TRACKS[setting]}`}>
    <div className="lb-track-heading">
      <span className="lb-track-rule" aria-hidden="true" />
      <DownloadResults eligible={eligible} view={view} />
    </div>
    {!ranked && <div className="lb-condition-tabs" role="group" aria-label="Evaluation condition">{Object.entries(CONDITIONS).filter(([key]) => key !== 'aggregate').map(([key, label]) => <button key={key} aria-pressed={condition === key} aria-controls={tableId} onClick={() => onChange({ condition: key, sort: null })}>{label}</button>)}</div>}
    <ResultsTable setting={setting} onSettingChange={onSettingChange} counts={counts} highlightRows={allRows} eligible={eligible} view={view} loading={loading} error={error} retry={retry} tableId={tableId} onSort={key => onChange(current => ({ sort: !ranked && current.sort?.key === key ? null : { key, asc: ranked ? false : !!METRICS[key].lower } }))} onReset={() => onChange({ sort: null })} />
  </section>;
}

export function Leaderboard() {
  const { data, error, retry } = useResults();
  const readSetting = () => ['zero', 'one'].includes(new URLSearchParams(window.location.search).get('setting')) ? new URLSearchParams(window.location.search).get('setting') : 'all';
  const [setting, setSetting] = useState(readSetting);
  const readViews = () => {
    const next = readLeaderboardViews(window.location.search, VIEW_COLUMNS);
    if (next.ranking.sort) next.ranking.sort.asc = false;
    if (next.results.sort) next.results.sort.asc = !!METRICS[next.results.sort.key].lower;
    return next;
  };
  const [views, setViews] = useState(readViews);
  useEffect(() => {
    const url = leaderboardViewsURL(views, window.location.href);
    if (setting === 'all') url.searchParams.delete('setting'); else url.searchParams.set('setting', setting);
    window.history.replaceState(window.history.state, '', url);
  }, [views, setting]);
  useEffect(() => {
    const restore = () => { setViews(readViews()); setSetting(readSetting()); };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  const changeView = (kind, change) => setViews(current => ({
    ...current,
    [kind]: { ...current[kind], ...(typeof change === 'function' ? change(current[kind]) : change) },
  }));
  const rankingRows = useMemo(() => unifiedRanking(data?.rows || []), [data]);
  const resultRows = useMemo(() => data ? mergeSubtaskResults(rankingRows) : [], [data, rankingRows]);
  return <main className="leaderboard-main" id="main-content" tabIndex={-1}>
    <header className="lb-heading"><h1><span>RoboValue</span> Leaderboard</h1><p>Compare robotic value models across four capability dimensions in simulation and real-world settings. All evaluation settings are ranked together by Overall.</p><nav className="lb-entry-links" aria-label="Evaluation documentation"><a className="lb-participate" href="/eval/">Participate in Evaluation <Icon size={18} /></a><a className="lb-metrics-link" href="/doc/get-started/protocol/">Protocol &amp; Metrics <Icon size={18} /></a></nav></header>
    <section className="lb-ranking" aria-labelledby="lb-ranking-title">
      <h2 id="lb-ranking-title">Overall Ranking</h2>
      <SettingsSummary />
      <UnifiedTable setting={setting} onSettingChange={setSetting} kind="ranking" state={views.ranking} onChange={change => changeView('ranking', change)} allRows={rankingRows} loading={!data} error={error} retry={retry} />
    </section>
    <section className="lb-results" aria-labelledby="lb-results-title">
      <h2 id="lb-results-title">Results</h2>
      <SettingsSummary />
      <UnifiedTable setting={setting} onSettingChange={setSetting} kind="results" state={views.results} onChange={change => changeView('results', change)} allRows={resultRows} loading={!data} error={error} retry={retry} />
    </section>
  </main>;
}
