import { SettingBadge, SettingsSummary } from './evaluation-setting';
import React, { useEffect, useMemo, useState } from 'react';
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

function ResultsTable({ eligible, view, loading, error, retry, tableId, onSort, onReset }) {
  const groups = metricGroups(view.condition);
  const columns = groups.flatMap(group => group.metrics);
  const rows = useMemo(() => sortedRows(eligible, view), [eligible, view]);
  const highlights = scoreHighlights(eligible, view.condition, columns, METRICS);
  const ranked = view.condition === 'aggregate';
  const metricHeader = key => {
    const capability = capabilityFor(key);
    const label = ranked && capability ? CAPABILITY_TABLE_HEADERS[capability.id] : METRICS[key].label;
    const ascending = view.sort?.key === key && view.sort.asc;
    return <th key={key} scope="col" className={key === 'overall' ? 'lb-overall-column' : ''} aria-sort={view.sort?.key === key ? ascending ? 'ascending' : 'descending' : 'none'} style={{ '--capability-color': COLORS[capability?.id] }}>
      <button className="lb-sort-button" onClick={() => onSort(key)} disabled={!rows.length} title={`${METRICS[key].name} · ${METRICS[key].lower ? 'Lower' : 'Higher'} is better${key === 'sia' ? ' · Not included in Overall' : ''}`}>
        <span className={ranked && capability ? 'lb-capability-heading' : undefined}>{label}</span><span className="lb-direction" aria-hidden="true">{METRICS[key].lower ? '↓' : '↑'}</span>{view.sort?.key === key && <span className="lb-sort-state" aria-hidden="true">{ascending ? '▴' : '▾'}</span>}
      </button>
    </th>;
  };
  return <>
      <div className="lb-table-frame"><div className="lb-table-scroll" tabIndex={0} role="region" aria-label={`${CONDITIONS[view.condition]} results, all settings`}>
        <table id={tableId} className={`lb-table ${ranked ? 'lb-table-aggregate' : 'lb-table-metrics'}`}>
          <caption className="sr-only">{CONDITIONS[view.condition]}, all settings. {ranked ? 'Published capability scores; higher is better. Rank compares all settings by Overall and is preserved when sorting.' : 'Raw metric scores ×100. FPL: lower is better; other metrics: higher is better. SIA does not contribute to Overall. Dashes indicate unreported metrics.'}</caption>
          <thead>{ranked ? <tr><th scope="col" className="lb-rank">Rank</th><th scope="col" className="lb-model">Model</th><th scope="col" className="lb-setting">Setting</th>{columns.map(metricHeader)}</tr> : <>
            <tr className="lb-group-row"><th rowSpan={2} scope="col" className="lb-model">Model</th><th rowSpan={2} scope="col" className="lb-setting">Setting</th>{groups.map(group => <th key={group.id} colSpan={group.metrics.length} scope="colgroup" style={{ '--capability-color': COLORS[group.id] }}>{group.title}</th>)}</tr>
            <tr className="lb-metric-row">{columns.map(metricHeader)}</tr>
          </>}</thead>
          <tbody>{rows.map(row => <tr key={row.id}>
            {ranked && <td className="lb-rank">{row.aggregate.rank}</td>}
            <th scope="row" className="lb-model"><RankingModel row={row} /></th>
            <td className="lb-setting"><SettingBadge setting={row.setting} /></td>
            {columns.map(key => <td key={key} className={key === 'overall' ? 'lb-overall-column' : ''}><Score value={scoreValue(row, view.condition, key)} highlight={highlights[key]} excluded={excludedHighlight(row, key)} overall={key === 'overall'} /></td>)}
          </tr>)}</tbody>
        </table>
      </div>{!rows.length && <div className="lb-empty" role="status">{error ? <>Results could not be loaded. <button onClick={retry}>Try Again</button></> : loading ? 'Loading results…' : 'No results yet.'}</div>}</div>
      {!!rows.length && <div className="lb-table-legend"><span><b>Best</b> · <span className="lb-second">Second Best</span></span>{view.sort && <button onClick={onReset}>Reset {ranked ? 'Ranking' : 'Order'}</button>}</div>}
  </>;
}

function DownloadResults({ eligible, view }) {
  const columns = metricGroups(view.condition).flatMap(group => group.metrics);
  return <button className="lb-download" aria-label={`Download all settings ${CONDITIONS[view.condition]} results as CSV`} disabled={!eligible.length} onClick={() => saveCSV(resultsCSV(sortedRows(eligible, view), view, columns, METRICS, TRACKS), `robovalue-all-settings-${view.condition}-results.csv`)}><Icon name="down" size={15} />CSV</button>;
}

function UnifiedTable({ kind, allRows, loading, error, retry, state, onChange }) {
  const ranked = kind === 'ranking';
  const { condition = 'id', sort } = state;
  const eligible = allRows;
  const view = { track: 'all', condition: ranked ? 'aggregate' : condition, sort, query: '', capability: 'all', selected: [] };
  const tableId = `lb-${kind}-table`;
  return <section className="lb-track-section" data-kind={kind} aria-label={ranked ? 'Overall Ranking, all settings' : 'Results, all settings'}>
    <div className="lb-track-heading">
      <span className="lb-track-rule" aria-hidden="true" />
      <DownloadResults eligible={eligible} view={view} />
    </div>
    {!ranked && <div className="lb-condition-tabs" role="group" aria-label="Evaluation condition">{Object.entries(CONDITIONS).filter(([key]) => key !== 'aggregate').map(([key, label]) => <button key={key} aria-pressed={condition === key} aria-controls={tableId} onClick={() => onChange({ condition: key, sort: null })}>{label}</button>)}</div>}
    <ResultsTable eligible={eligible} view={view} loading={loading} error={error} retry={retry} tableId={tableId} onSort={key => onChange(current => ({ sort: { key, asc: current.sort?.key === key ? !current.sort.asc : !!METRICS[key].lower } }))} onReset={() => onChange({ sort: null })} />
  </section>;
}

export function Leaderboard() {
  const { data, error, retry } = useResults();
  const [views, setViews] = useState(() => readLeaderboardViews(window.location.search, VIEW_COLUMNS));
  useEffect(() => {
    const url = leaderboardViewsURL(views, window.location.href);
    window.history.replaceState(window.history.state, '', url);
  }, [views]);
  useEffect(() => {
    const restore = () => setViews(readLeaderboardViews(window.location.search, VIEW_COLUMNS));
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
      <UnifiedTable kind="ranking" state={views.ranking} onChange={change => changeView('ranking', change)} allRows={rankingRows} loading={!data} error={error} retry={retry} />
    </section>
    <section className="lb-results" aria-labelledby="lb-results-title">
      <h2 id="lb-results-title">Results</h2>
      <SettingsSummary />
      <UnifiedTable kind="results" state={views.results} onChange={change => changeView('results', change)} allRows={resultRows} loading={!data} error={error} retry={retry} />
    </section>
  </main>;
}
