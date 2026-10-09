import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from './benchmark';
import { GROUPS, METRICS, CONDITIONS, excludedHighlight, scoreValue } from './benchmark-metrics';
import { TRACKS, metricGroups, readView, resultsCSV, scoreHighlights, sortedRows, viewURL } from './leaderboard-utils';
import { RankingModel } from './ranking-model';
import subtaskData from './data/subtask-results.json';
import { useResults } from './use-results';
import './leaderboard.css';

// Local presentation keeps the other pages unchanged.
const COLORS = { understanding: '#366c9a', tracking: '#447d64', diagnosis: '#a56f2d', consistency: '#a45368' };
const format = value => value == null ? '—' : value.toFixed(2);
const cleanView = search => ({ ...readView(search), capability: 'all', query: '', selected: [] });
const capabilityFor = key => GROUPS.find(group => group.id === key || group.metrics.includes(key));

function saveCSV(csv, filename) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


function Score({ value, highlight, excluded, overall = false }) {
  const mark = value == null || excluded ? '' : value === highlight?.best ? 'lb-best' : value === highlight?.second ? 'lb-second' : '';
  return <span className={`lb-value ${mark} ${overall ? 'lb-overall-value' : ''}`}>
    {format(value)}{excluded && <sup title="Excluded from best and second-best highlighting, following the manuscript">§</sup>}
  </span>;
}

function SubtaskResults({ track }) {
  const rows = subtaskData.rows.filter(row => row.setting === track);
  const columns = ['id', 'emb', 'env', 'overall'];
  const labels = { id: 'Standard (ID)', emb: 'Cross-Embodiment', env: 'Cross-Environment', overall: 'Mean' };
  const highlights = Object.fromEntries(columns.map(key => {
    const values = [...new Set(rows.map(row => key === 'overall' ? row.overall : row.conditions[key]))].sort((a, b) => b - a);
    return [key, { best: values[0], second: values[1] }];
  }));
  return <details className="lb-subtasks">
    <summary>Subtask Identification Accuracy (SIA)<Icon name="chevron" size={16} /></summary>
    <div className="lb-subtasks-body">
      <p>{TRACKS[track]} · Textual subtask identification, reported separately from the overall ranking. Higher is better.</p>
      <div className="lb-table-scroll" role="region" tabIndex={0} aria-label="Subtask identification results">
        <table className="lb-sia-table">
          <caption className="sr-only">Subtask Identification Accuracy, {TRACKS[track]}, scores ×100. Mean averages the three conditions.</caption>
          <thead><tr><th scope="col">Model</th>{columns.map(key => <th scope="col" key={key}>{labels[key]} ↑</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.name}><th scope="row"><RankingModel row={row} /></th>{columns.map(key => <td key={key}><Score value={key === 'overall' ? row.overall : row.conditions[key]} highlight={highlights[key]} overall={key === 'overall'} /></td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="lb-footnote">Mean gives equal weight to the three conditions, before rounding. SIA is not included in the four capability scores; FailSafe is evaluated only for SIA. Source: Table 6, {subtaskData.sourceVersion} manuscript.</p>
    </div>
  </details>;
}

export function Leaderboard() {
  const { data, error, retry } = useResults();
  const [view, setView] = useState(() => cleanView(window.location.search));
  useEffect(() => { window.history.replaceState(window.history.state, '', viewURL(view, window.location.href)); }, [view]);
  useEffect(() => {
    const restore = () => setView(cleanView(window.location.search));
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  const eligible = useMemo(() => (data?.rows || []).filter(row => row.setting === view.track), [data, view.track]);
  const groups = metricGroups(view.condition);
  const columns = groups.flatMap(group => group.metrics);
  const rows = useMemo(() => sortedRows(eligible, view), [eligible, view]);
  const highlights = scoreHighlights(eligible, view.condition, columns);
  const ranked = view.condition === 'aggregate';
  const update = patch => setView(current => ({ ...current, ...patch }));
  const sortBy = key => setView(current => ({ ...current, sort: { key, asc: current.sort?.key === key ? !current.sort.asc : !!METRICS[key].lower } }));
  const sourceTable = ranked ? 2 : view.condition === 'id' ? 3 : 4;
  const metricHeader = key => {
    const capability = capabilityFor(key);
    const label = ranked && capability ? capability.title : METRICS[key].label;
    const ascending = view.sort?.key === key && view.sort.asc;
    return <th key={key} scope="col" className={key === 'overall' ? 'lb-overall-column' : ''} aria-sort={view.sort?.key === key ? ascending ? 'ascending' : 'descending' : 'none'} style={{ '--capability-color': COLORS[capability?.id] }}>
      <button className="lb-sort-button" onClick={() => sortBy(key)} title={`${METRICS[key].name} · ${METRICS[key].lower ? 'Lower' : 'Higher'} is better`}>
        <span>{label}</span><span className="lb-direction" aria-hidden="true">{METRICS[key].lower ? '↓' : '↑'}</span>{view.sort?.key === key && <span className="lb-sort-state" aria-hidden="true">{ascending ? '▴' : '▾'}</span>}
      </button>
    </th>;
  };
  return <main className="leaderboard-main" id="main-content" tabIndex={-1}>
    <header className="lb-heading"><div className="lb-heading-row"><h1><span>RoboValue</span> Leaderboard</h1><a className="lb-participate" href="/doc/get-started/adapters/">Participate in evaluation <Icon size={16} /></a></div><p>Compare robotic value models across four capability dimensions in simulation and the real world, with separate Zero-Shot and One-Shot rankings.</p></header>
    <section className="lb-results" aria-label="RoboValue evaluation results">
      <div className="lb-condition-tabs" role="group" aria-label="Evaluation condition">{Object.entries(CONDITIONS).map(([key, label]) => <button key={key} aria-pressed={view.condition === key} aria-controls="lb-results-table" onClick={() => update({ condition: key, sort: null })}>{label}</button>)}</div>
      <div className="lb-controls">
        <div className="lb-track-switch" role="group" aria-label="Evaluation track">{Object.entries(TRACKS).map(([key, label]) => <button key={key} aria-pressed={view.track === key} aria-controls="lb-results-table" onClick={() => update({ track: key })}>{label}</button>)}</div>
        <button className="lb-download" aria-label="Download results as CSV" disabled={!rows.length} onClick={() => saveCSV(resultsCSV(rows, view, columns), `robovalue-${view.track}-${view.condition}-results.csv`)}><Icon name="down" size={15} />CSV</button>
      </div>
      <p className="lb-track-description" aria-live="polite">{view.track === 'zero' ? 'Released checkpoints, without task-specific adaptation or reference demonstrations.' : 'One standard training demonstration per task, used for conditioning or adaptation; test trajectories are held out.'}</p>
      <div className="lb-table-frame"><div className="lb-table-scroll" tabIndex={0} role="region" aria-label="Leaderboard results">
        <table id="lb-results-table" className={`lb-table ${ranked ? 'lb-table-aggregate' : 'lb-table-metrics'}`}>
          <caption className="sr-only">{CONDITIONS[view.condition]}, {TRACKS[view.track]}. {ranked ? 'Normalized capability scores from 0 to 100; higher is better. Rank is the overall rank within this track, preserved when sorting.' : 'Raw metric scores ×100. FPL: lower is better; other metrics: higher is better.'}</caption>
          <thead>{ranked ? <tr><th scope="col" className="lb-rank">Rank</th><th scope="col" className="lb-model">Model</th>{columns.map(metricHeader)}</tr> : <>
            <tr className="lb-group-row"><th rowSpan={2} scope="col" className="lb-model">Model</th>{groups.map(group => <th key={group.id} colSpan={group.metrics.length} scope="colgroup" style={{ '--capability-color': COLORS[group.id] }}>{group.title}</th>)}</tr>
            <tr className="lb-metric-row">{columns.map(metricHeader)}</tr>
          </>}</thead>
          <tbody>{rows.map(row => <tr key={row.id}>
            {ranked && <td className="lb-rank">{row.aggregate.rank}</td>}
            <th scope="row" className="lb-model"><RankingModel row={row} /></th>
            {columns.map(key => <td key={key} className={key === 'overall' ? 'lb-overall-column' : ''}><Score value={scoreValue(row, view.condition, key)} highlight={highlights[key]} excluded={excludedHighlight(row, key)} overall={key === 'overall'} /></td>)}
          </tr>)}{!rows.length && <tr><td colSpan={columns.length + 1 + Number(ranked)} className="lb-empty">{error ? <>Results could not be loaded. <button onClick={retry}>Try again</button></> : 'Loading results…'}</td></tr>}</tbody>
        </table>
      </div></div>
      <div className="lb-table-legend"><span><b>Best</b> · <span className="lb-second">Second best</span> · {ranked ? '0–100, higher is better' : 'Scores ×100; FPL ↓, others ↑; — not reported'}</span>{view.sort && <button onClick={() => update({ sort: null })}>Reset {ranked ? 'ranking' : 'order'}</button>}</div>
      <div className="lb-result-notes">
        {ranked ? <p>Overall is the mean of the four capability scores, aggregated across applicable ID and OOD conditions. Zero-shot and one-shot are ranked separately; simulation and real-world domains receive equal weight.</p> : <p>Simulation and real-world domains receive equal weight.{view.condition !== 'id' && ' TRR and CSVC are evaluated only in the standard (ID) setting.'}{view.track === 'zero' && ' § TOPReward’s VOC and Memory-VOC are excluded from best/second-best marking, following the paper.'}</p>}
        <p>{view.track === 'zero' ? <>‡ TOPReward uses Qwen3-VL-8B. {ranked ? 'RoboReward’s unmeasured VS and CSVC count as zero in aggregate scoring.' : 'RoboReward’s VS and CSVC are not measured.'}</> : 'Preview identifies the Robo-Dopamine 2.0 checkpoints.'}</p>
      </div>
      <div className="lb-source-row"><span>Source: Table {sourceTable} · {data?.sourceVersion || '2026-10-09'} manuscript</span><a href="/doc/get-started/protocol/">Scoring & metrics <Icon size={14} /></a></div>
    </section>
    <SubtaskResults track={view.track} />
  </main>;
}
