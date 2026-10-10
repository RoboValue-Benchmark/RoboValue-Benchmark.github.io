import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from './benchmark';
import { GROUPS, METRICS as BASE_METRICS, CONDITIONS, excludedHighlight, scoreValue } from './benchmark-metrics';
import { TRACKS, metricGroups as publishedMetricGroups, readView, resultsCSV, scoreHighlights, sortedRows, viewURL } from './leaderboard-utils';
import { RankingModel } from './ranking-model';
import subtaskData from './data/subtask-results.json';
import { useResults } from './use-results';
import './leaderboard.css';

// Local presentation keeps the other pages unchanged.
const COLORS = { understanding: '#366c9a', tracking: '#447d64', diagnosis: '#a56f2d', consistency: '#a45368' };
const METRICS = { ...BASE_METRICS, sia: { label: 'SIA', name: 'Subtask Identification Accuracy' } };
const metricGroups = condition => publishedMetricGroups(condition).map(group =>
  group.id === 'understanding' ? { ...group, metrics: [...group.metrics, 'sia'] } : group
);
const format = value => value == null ? '—' : value.toFixed(2);
const cleanView = search => {
  const parsed = readView(search);
  const params = new URLSearchParams(search);
  const track = Object.hasOwn(TRACKS, params.get('track')) ? params.get('track') : 'zero';
  const rankingTrack = Object.hasOwn(TRACKS, params.get('ranking-track')) ? params.get('ranking-track') : track;
  const sortKey = params.get('sort');
  const sort = metricGroups(parsed.condition).some(group => group.metrics.includes(sortKey))
    ? { key: sortKey, asc: params.get('direction') === 'asc' } : null;
  const rankingKey = params.get('ranking-sort');
  const rankingSort = metricGroups('aggregate')[0].metrics.includes(rankingKey)
    ? { key: rankingKey, asc: params.get('ranking-direction') === 'asc' }
    : parsed.condition === 'aggregate' ? sort : null;
  return { ...parsed, track, rankingTrack, condition: parsed.condition === 'aggregate' ? 'id' : parsed.condition, sort: parsed.condition === 'aggregate' ? null : sort, rankingSort, capability: 'all', query: '', selected: [] };
};
const capabilityFor = key => GROUPS.find(group => group.id === key || group.metrics.includes(key) || key === 'sia' && group.id === 'understanding');

function mergeSubtaskResults(rows) {
  const keyFor = row => `${row.setting}:${row.name}`;
  const remaining = new Map(subtaskData.rows.map(row => [keyFor(row), row]));
  const merged = rows.map(row => {
    const subtask = remaining.get(keyFor(row));
    if (!subtask) return row;
    remaining.delete(keyFor(row));
    return { ...row, conditions: { ...row.conditions, ...Object.fromEntries(Object.entries(subtask.conditions).map(([condition, sia]) =>
      [condition, { ...row.conditions?.[condition], sia: row.conditions?.[condition]?.sia ?? sia }]
    )) } };
  });
  let order = Math.max(-1, ...rows.map(row => row.order)) + 1;
  for (const subtask of remaining.values()) {
    merged.push({
      id: `${subtask.name.toLowerCase()}-${subtask.setting}-sia`, name: subtask.name,
      setting: subtask.setting, order: order++,
      conditions: Object.fromEntries(Object.entries(subtask.conditions).map(([condition, sia]) => [condition, { sia }])),
    });
  }
  return merged;
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
    const label = ranked && capability ? capability.short : METRICS[key].label;
    const ascending = view.sort?.key === key && view.sort.asc;
    return <th key={key} scope="col" className={key === 'overall' ? 'lb-overall-column' : ''} aria-sort={view.sort?.key === key ? ascending ? 'ascending' : 'descending' : 'none'} style={{ '--capability-color': COLORS[capability?.id] }}>
      <button className="lb-sort-button" onClick={() => onSort(key)} disabled={!rows.length} title={`${METRICS[key].name} · ${METRICS[key].lower ? 'Lower' : 'Higher'} is better${key === 'sia' ? ' · Not included in Overall' : ''}`}>
        <span>{label}</span><span className="lb-direction" aria-hidden="true">{METRICS[key].lower ? '↓' : '↑'}</span>{view.sort?.key === key && <span className="lb-sort-state" aria-hidden="true">{ascending ? '▴' : '▾'}</span>}
      </button>
    </th>;
  };
  return <>
      <div className="lb-table-frame"><div className="lb-table-scroll" tabIndex={0} role="region" aria-label={`${CONDITIONS[view.condition]} results, ${TRACKS[view.track]}`}>
        <table id={tableId} className={`lb-table ${ranked ? 'lb-table-aggregate' : 'lb-table-metrics'}`}>
          <caption className="sr-only">{CONDITIONS[view.condition]}, {TRACKS[view.track]}. {ranked ? 'Normalized capability scores from 0 to 100; higher is better. Rank is the overall rank within this track, preserved when sorting.' : 'Raw metric scores ×100. FPL: lower is better; other metrics: higher is better. SIA does not contribute to Overall. Dashes indicate unreported metrics.'}</caption>
          <thead>{ranked ? <tr><th scope="col" className="lb-rank">Rank</th><th scope="col" className="lb-model">Model</th>{columns.map(metricHeader)}</tr> : <>
            <tr className="lb-group-row"><th rowSpan={2} scope="col" className="lb-model">Model</th>{groups.map(group => <th key={group.id} colSpan={group.metrics.length} scope="colgroup" style={{ '--capability-color': COLORS[group.id] }}>{group.title}</th>)}</tr>
            <tr className="lb-metric-row">{columns.map(metricHeader)}</tr>
          </>}</thead>
          <tbody>{rows.map(row => <tr key={row.id}>
            {ranked && <td className="lb-rank">{row.aggregate.rank}</td>}
            <th scope="row" className="lb-model"><RankingModel row={row} /></th>
            {columns.map(key => <td key={key} className={key === 'overall' ? 'lb-overall-column' : ''}><Score value={scoreValue(row, view.condition, key)} highlight={highlights[key]} excluded={excludedHighlight(row, key)} overall={key === 'overall'} /></td>)}
          </tr>)}</tbody>
        </table>
      </div>{!rows.length && <div className="lb-empty" role="status">{view.track === 'full' ? 'No results yet.' : error ? <>Results could not be loaded. <button onClick={retry}>Try Again</button></> : loading ? 'Loading results…' : 'No results yet.'}</div>}</div>
      {!!rows.length && <div className="lb-table-legend"><span><b>Best</b> · <span className="lb-second">Second Best</span></span>{view.sort && <button onClick={onReset}>Reset {ranked ? 'Ranking' : 'Order'}</button>}</div>}
      {view.track === 'zero' && <p className="lb-result-note">‡ TOPReward uses Qwen3-VL-8B.</p>}
  </>;
}

function TableControls({ eligible, view, onTrack, tableId }) {
  const columns = metricGroups(view.condition).flatMap(group => group.metrics);
  return <div className="lb-controls">
    <div className="lb-track-switch" role="group" aria-label={`${CONDITIONS[view.condition]} evaluation track`}>{Object.entries(TRACKS).map(([key, label]) => <button key={key} aria-pressed={view.track === key} aria-controls={tableId} onClick={() => onTrack(key)}>{label}</button>)}</div>
    <button className="lb-download" aria-label={`Download ${CONDITIONS[view.condition]} results as CSV`} disabled={!eligible.length} onClick={() => saveCSV(resultsCSV(sortedRows(eligible, view), view, columns, METRICS, TRACKS), `robovalue-${view.track}-${view.condition}-results.csv`)}><Icon name="down" size={15} />CSV</button>
  </div>;
}

export function Leaderboard() {
  const { data, error, retry } = useResults();
  const [view, setView] = useState(() => cleanView(window.location.search));
  useEffect(() => {
    const url = viewURL({ ...view, condition: view.condition === 'id' && !view.sort ? 'aggregate' : view.condition }, window.location.href);
    url.searchParams.delete('ranking-track');
    if (view.rankingTrack !== view.track) url.searchParams.set('ranking-track', view.rankingTrack);
    url.searchParams.delete('ranking-sort');
    url.searchParams.delete('ranking-direction');
    if (view.rankingSort) {
      url.searchParams.set('ranking-sort', view.rankingSort.key);
      url.searchParams.set('ranking-direction', view.rankingSort.asc ? 'asc' : 'desc');
    }
    window.history.replaceState(window.history.state, '', url);
  }, [view]);
  useEffect(() => {
    const restore = () => setView(cleanView(window.location.search));
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  const eligible = useMemo(() => (data?.rows || []).filter(row => row.setting === view.rankingTrack), [data, view.rankingTrack]);
  const resultRows = useMemo(() => data ? mergeSubtaskResults(data.rows).filter(row => row.setting === view.track) : [], [data, view.track]);
  const rankingView = useMemo(() => ({ ...view, track: view.rankingTrack, condition: 'aggregate', sort: view.rankingSort }), [view]);
  const update = patch => setView(current => ({ ...current, ...patch }));
  const sortBy = (key, ranking) => setView(current => {
    const field = ranking ? 'rankingSort' : 'sort';
    return { ...current, [field]: { key, asc: current[field]?.key === key ? !current[field].asc : !!METRICS[key].lower } };
  });
  return <main className="leaderboard-main" id="main-content" tabIndex={-1}>
    <header className="lb-heading"><h1><span>RoboValue</span> Leaderboard</h1><p>Compare robotic value models across four capability dimensions in simulation and the real world. Evaluation tracks are ranked separately.</p><nav className="lb-entry-links" aria-label="Evaluation documentation"><a className="lb-participate" href="/doc/get-started/evaluation/">Participate in Evaluation <Icon size={18} /></a><a className="lb-metrics-link" href="/doc/get-started/protocol/">Protocol &amp; Metrics <Icon size={18} /></a></nav></header>
    <section className="lb-ranking" aria-labelledby="lb-ranking-title">
      <h2 id="lb-ranking-title">Overall Ranking</h2>
      <TableControls eligible={eligible} view={rankingView} tableId="lb-ranking-table" onTrack={rankingTrack => update({ rankingTrack })} />
      <ResultsTable eligible={eligible} view={rankingView} loading={!data} error={error} retry={retry} tableId="lb-ranking-table" onSort={key => sortBy(key, true)} onReset={() => update({ rankingSort: null })} />
    </section>
    <section className="lb-results" aria-labelledby="lb-results-title">
      <h2 id="lb-results-title">Results</h2>
      <div className="lb-condition-tabs" role="group" aria-label="Evaluation condition">{Object.entries(CONDITIONS).filter(([key]) => key !== 'aggregate').map(([key, label]) => <button key={key} aria-pressed={view.condition === key} aria-controls="lb-results-table" onClick={() => update({ condition: key, sort: null })}>{label}</button>)}</div>
      <TableControls eligible={resultRows} view={view} tableId="lb-results-table" onTrack={track => update({ track })} />
      <ResultsTable eligible={resultRows} view={view} loading={!data} error={error} retry={retry} tableId="lb-results-table" onSort={key => sortBy(key, false)} onReset={() => update({ sort: null })} />
    </section>
  </main>;
}
