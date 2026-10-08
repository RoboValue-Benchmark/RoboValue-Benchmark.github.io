import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './benchmark';
import { GROUPS, METRICS, CONDITIONS, excludedHighlight, scoreValue } from './benchmark-metrics';
import { TRACKS, metricGroups, modelName, readView, resultsCSV, scoreHighlights, sortedRows, viewURL } from './leaderboard-utils';
import subtaskData from './data/subtask-results.json';
import './leaderboard.css';

const COMPARISON_COLORS = ['#6952bf', '#247e93', '#b56735'];
const CORRELATIONS = ['voc', 'cycle_voc', 'memory_voc', 'csvc'];
const CAPABILITY_RULES = {
  understanding: 'Equal weight to SA and TGA; TGA is the mean of TGA-CT and TGA-CF. SIA is reported separately.',
  tracking: 'Half the weight goes to the mean of normalized VOC and Memory-VOC, and half to normalized VROC. VROC is averaged equally across the three conditions. Cycle-VOC is not added separately.',
  diagnosis: 'Equal weight to normalized FPL (100 − FPL) and TRR. TRR uses ID results only.',
  consistency: 'Equal weight to VS and normalized CSVC ((CSVC + 100) / 2). CSVC uses ID results only. Unmeasured metrics contribute zero.',
};
const format = value => value == null ? '—' : value.toFixed(2);

function saveCSV(csv, filename) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MetricHelp({ metric, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { if (metric) dialog.current.showModal(); }, [metric]);
  if (!metric) return null;
  const info = METRICS[metric];
  const range = CORRELATIONS.includes(metric) ? '−100 to 100' : '0 to 100';
  const direction = info.lower ? 'Lower is better' : 'Higher is better';
  return <dialog className="lb-metric-dialog" ref={dialog} aria-labelledby="metric-dialog-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
    <button type="button" className="lb-dialog-close" aria-label="Close metric explanation" onClick={() => dialog.current.close()}><Icon name="close" /></button>
    <p className="lb-kicker">{info.label} · {direction}</p><h2 id="metric-dialog-title">{info.name}</h2>
    <p>{info.description}</p>
    <div className="lb-metric-range"><span>Displayed range</span><strong>{range}</strong></div>
    {CAPABILITY_RULES[metric] && <p>{CAPABILITY_RULES[metric]}</p>}
    {metric === 'overall' && <p>Four capabilities receive equal weight. Zero-shot and one-shot have independent rankings. Scores reproduce Table 1, with no recomputation from rounded table entries.</p>}
    {metric === 'cycle_voc' && <p>The score averages forward- and reverse-half correlations. The reverse-half result (VROC) is used in aggregate scoring to avoid counting forward tracking twice.</p>}
    {!CAPABILITY_RULES[metric] && metric !== 'overall' && <a className="lb-link" href={`/doc/get-started/protocol/#metric-${metric}`}>Read the evaluation protocol <Icon /></a>}
  </dialog>;
}

function Score({ value, highlight, excluded, overall = false }) {
  const mark = value == null || excluded ? '' : value === highlight?.best ? 'lb-best' : value === highlight?.second ? 'lb-second' : '';
  return <span className={`lb-value ${mark} ${overall ? 'lb-overall-value' : ''}`}>
    {format(value)}{excluded && <sup title="Excluded from best and second-best highlighting, following the manuscript">§</sup>}
  </span>;
}

function ModelComparison({ rows, onRemove, onClear }) {
  if (!rows.length) return null;
  return <section className="lb-comparison" aria-labelledby="comparison-title">
    <div className="lb-section-heading"><div><p className="lb-kicker">MODEL COMPARISON</p><h2 id="comparison-title">Compare capability profiles</h2><p>Table 1 aggregate scores across ID and OOD conditions, within the selected track. Scores range from 0 to 100; higher is better.</p></div><button className="lb-quiet-button" onClick={onClear}>Clear selection</button></div>
    <div className="lb-comparison-legend">{rows.map((row, index) => <span key={row.id} style={{ '--model-color': COMPARISON_COLORS[index] }}><i />{modelName(row)}<button aria-label={`Remove ${modelName(row)} from comparison`} onClick={() => onRemove(row.id)}><Icon name="close" size={14} /></button></span>)}</div>
    {rows.length === 1 && <p className="lb-selection-hint">Select another model in the table to compare. You can select up to three.</p>}
    <div className="lb-profile-grid">{GROUPS.map(group => <div className="lb-profile" key={group.id}><h3>{group.title}</h3>{rows.map((row, index) => <div className="lb-profile-row" key={row.id} style={{ '--model-color': COMPARISON_COLORS[index] }}><div><span>{modelName(row)}</span><strong>{format(row.aggregate[group.id])}</strong></div><div className="lb-bar-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, row.aggregate[group.id]))}%` }} /></div></div>)}</div>)}</div>
  </section>;
}

function PaperFindings({ rows, track, onExplore }) {
  const find = (name, preview = false) => rows.find(row => row.name === name && row.preview === preview);
  const examples = track === 'zero' ? [
    { row: find('RynnValue-4B'), title: 'Fine-grained instructions remain difficult', left: 'tga_ct', right: 'tga_cf', capability: 'understanding', text: 'Discriminating different tasks is easier than resolving a changed object, action, placement, or constraint.' },
    { row: find('TOPReward'), title: 'Forward progress can hide reversal errors', left: 'voc', right: 'cycle_voc', capability: 'tracking', text: 'Strong forward correlation can coexist with poor responses when the recorded progress reverses.' },
    { row: find('RoboMeter-4B'), title: 'Execution history needs its own test', left: 'voc', right: 'memory_voc', capability: 'tracking', text: 'Tracking fluent execution does not establish reliable progress judgments when similar visual states recur.' },
  ] : [
    { row: find('Robo-Dopamine-8B', true), title: 'Outcome accuracy does not establish grounding', left: 'sa', right: 'tga_cf', capability: 'understanding', text: 'Strong outcome discrimination can coexist with weak sensitivity to fine-grained instruction changes.' },
    { row: find('ProcVLM-2B'), title: 'A demonstration does not resolve execution memory', left: 'voc', right: 'memory_voc', capability: 'tracking', text: 'Task adaptation improves fluent progress tracking, while recurring states still pose a challenge.' },
    { row: find('Robo-Dopamine-8B', true), title: 'Recovery assessment remains challenging', left: 'cycle_voc', right: 'trr', capability: 'diagnosis', text: 'Reliable direction tracking does not imply that every failure and recovery stage is assessed correctly.' },
  ];
  return <section className="lb-findings" aria-labelledby="findings-title"><div className="lb-section-heading"><div><p className="lb-kicker">BEYOND THE OVERALL SCORE</p><h2 id="findings-title">What the evaluations reveal</h2><p>Examples from standard (ID), {TRACKS[track].toLowerCase()} evaluation. Values are raw metric scores ×100.</p></div></div><div className="lb-findings-grid">{examples.filter(example => example.row).map((example, index) => <article key={index}><span className="lb-finding-number">0{index + 1}</span><h3>{example.title}</h3><p className="lb-finding-model">{modelName(example.row)}</p><div className="lb-finding-scores">{[example.left, example.right].map(key => <div key={key}><span>{METRICS[key].label}</span><strong>{format(example.row.conditions.id[key])}</strong></div>)}</div><p>{example.text}</p><button className="lb-link" onClick={() => onExplore(example)}>Explore these results <Icon size={16} /></button></article>)}</div></section>;
}

function ScoringGuide() {
  return <details className="lb-scoring" id="scoring"><summary><span><strong>How the leaderboard is scored</strong><span>Normalization, condition weights, and capability aggregation</span></span><span aria-hidden="true">+</span></summary>
    <div className="lb-scoring-body"><p>Scores follow the manuscript’s theoretical-range normalization and fixed weights. Each track is ranked independently by the mean of four capability scores, computed before rounding.</p>
      <div className="lb-scoring-steps"><div><span>01 · Normalize</span><p>VOC, Memory-VOC, VROC and CSVC: <code>(x + 100) / 2</code>.<br />FPL: <code>100 − x</code>.<br />Other metrics retain their ×100 scores.</p></div><div><span>02 · Aggregate conditions</span><p>Most metrics use ID / embodiment / environment weights of <strong>½ / ¼ / ¼</strong>. TRR and CSVC use ID only. VROC uses <strong>⅓ / ⅓ / ⅓</strong>. Simulation and real-world domains receive equal weight.</p></div><div><span>03 · Aggregate capabilities</span><p>The four capability scores receive equal weight. Missing metrics contribute zero after normalization; their weights are not redistributed.</p></div></div>
      <div className="lb-scoring-capabilities">{GROUPS.map(group => <div key={group.id}><h3>{group.title}</h3><p>{CAPABILITY_RULES[group.id]}</p></div>)}</div>
      <p><strong>VROC</strong> is the reverse-half Spearman correlation with forward context retained. It contributes to the aggregate tracking score but is not separately reported in Tables 2–3. This website reproduces Table 1 rather than inferring VROC from rounded values. <strong>SIA</strong> is reported separately below and contributes no weight to the aggregate ranking.</p>
      <a className="lb-link" href="/doc/get-started/protocol/">Explore all metric definitions <Icon size={16} /></a>
    </div>
  </details>;
}

function SubtaskResults({ track }) {
  const rows = subtaskData.rows.filter(row => row.setting === track);
  const columns = ['id', 'emb', 'env', 'overall'];
  const labels = { id: 'Standard (ID)', emb: 'Cross-Embodiment', env: 'Cross-Environment', overall: 'Overall' };
  const highlights = Object.fromEntries(columns.map(key => {
    const values = [...new Set(rows.map(row => key === 'overall' ? row.overall : row.conditions[key]))].sort((a, b) => b - a);
    return [key, { best: values[0], second: values[1] }];
  }));
  return <section className="lb-subtasks" aria-labelledby="subtasks-title"><div className="lb-section-heading"><div><p className="lb-kicker">SEPARATE TEXTUAL EVALUATION</p><h2 id="subtasks-title">Subtask identification</h2><p>SIA tests whether a generated description matches the active subtask. These scores are separate from the four-capability ranking.</p></div><span className="lb-track-label">{TRACKS[track]}</span></div>
    <div className="lb-table-scroll" role="region" tabIndex={0} aria-label="Scrollable subtask identification results"><table className="lb-sia-table"><caption className="sr-only">Subtask Identification Accuracy, {TRACKS[track]}, ×100. Higher is better. Overall averages the three conditions.</caption><thead><tr><th scope="col">Model</th>{columns.map(key => <th scope="col" key={key}>{labels[key]} <span aria-hidden="true">↑</span></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.name}><th scope="row">{row.name}</th>{columns.map(key => <td key={key}><Score value={key === 'overall' ? row.overall : row.conditions[key]} highlight={highlights[key]} overall={key === 'overall'} /></td>)}</tr>)}</tbody></table></div>
    <p className="lb-footnote">Overall averages ID, cross-embodiment and cross-environment equally, before rounding. A separate LLM judge supplies the ground-truth subtask probability; SIA uses geometric aggregation within each task. FailSafe is evaluated only for SIA. Source: Subtask Identification Results, manuscript snapshot {subtaskData.sourceVersion}.</p>
  </section>;
}

export function Leaderboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState(() => readView(window.location.search));
  const [help, setHelp] = useState(null);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(null);
  const comparisonRef = useRef(null);
  const boardRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch('/data/results.json', { signal: controller.signal }).then(response => { if (!response.ok) throw Error('Results unavailable'); return response.json(); }).then(setData).catch(error => { if (error.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const url = viewURL(view, window.location.href);
    window.history.replaceState(window.history.state, '', url);
  }, [view]);
  useEffect(() => {
    const restore = () => setView(readView(window.location.search));
    window.addEventListener('popstate', restore);
    return () => { window.removeEventListener('popstate', restore); clearTimeout(noticeTimer.current); };
  }, []);
  const eligible = useMemo(() => (data?.rows || []).filter(row => row.setting === view.track), [data, view.track]);
  useEffect(() => {
    if (!data) return;
    setView(current => {
      const selected = current.selected.filter(id => data.rows.some(row => row.id === id && row.setting === current.track));
      return selected.length === current.selected.length ? current : { ...current, selected };
    });
  }, [data, view.track]);
  const groups = metricGroups(view.condition, view.capability);
  const columns = groups.flatMap(group => group.metrics);
  const rows = useMemo(() => sortedRows(eligible, view), [eligible, view]);
  const highlights = scoreHighlights(eligible, view.condition, columns);
  const selected = view.selected.map(id => eligible.find(row => row.id === id)).filter(Boolean);
  const ranked = view.condition === 'aggregate';
  const update = patch => setView(current => ({ ...current, ...patch }));
  const toggleSelection = id => setView(current => ({ ...current, selected: current.selected.includes(id) ? current.selected.filter(value => value !== id) : current.selected.length < 3 ? [...current.selected, id] : current.selected }));
  const changeTrack = track => update({ track, selected: [] });
  const sortBy = key => setView(current => ({ ...current, sort: { key, asc: current.sort?.key === key ? !current.sort.asc : !!METRICS[key].lower } }));
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(viewURL(view, window.location.href).href); setNotice('Link copied'); }
    catch { setNotice('Copy the URL from your address bar to share this view.'); }
    clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(''), 4000);
  };
  const explore = example => { update({ condition: 'id', capability: example.capability, query: modelName(example.row), sort: null }); boardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return <main className="leaderboard-main" id="main-content" tabIndex={-1}>
    <section className="lb-hero"><p className="lb-kicker">ROBOVALUE · MODEL EVALUATION</p><div className="lb-hero-heading"><h1>Leaderboard</h1><span className="lb-snapshot">Manuscript snapshot · {data?.sourceVersion || '2026-10-07'}</span></div><p className="lb-lead">A closer look at robotic value feedback. Compare task-state understanding, temporal progress, failure and recovery, and value consistency across simulation and real-world tasks.</p>
      <div className="lb-facts"><div><strong>{data?.modelFamilies || 9}</strong><span>Value-model families</span></div><div><strong>{data?.modelVariants || 15}</strong><span>Model variants</span></div><div><strong>{data?.rows.length || 18}</strong><span>Evaluated configurations</span></div><div><strong>4</strong><span>Capability dimensions</span></div></div>
    </section>
    <section className="lb-results" aria-labelledby="results-title" ref={boardRef}>
      <div className="lb-section-heading"><div><h2 id="results-title">Explore the results</h2><p>Zero-shot and one-shot are ranked independently. Full-Data evaluation is planned.</p></div><a className="lb-link" href="#scoring">Scoring guide <Icon size={16} /></a></div>
      <div className="lb-board">
        <div className="lb-condition-tabs" role="group" aria-label="Evaluation condition">{Object.entries(CONDITIONS).map(([key, label]) => <button key={key} aria-pressed={view.condition === key} onClick={() => update({ condition: key, sort: null })}>{label}</button>)}</div>
        <div className="lb-controls"><div className="lb-track-switch" role="group" aria-label="Evaluation track">{Object.entries(TRACKS).map(([key, label]) => <button key={key} aria-pressed={view.track === key} onClick={() => changeTrack(key)}>{label}</button>)}</div><label className="lb-search"><Icon name="search" size={17} /><input type="search" aria-label="Find a model" placeholder="Find a model…" value={view.query} onChange={event => update({ query: event.target.value })} /></label><div className="lb-actions"><button className="lb-quiet-button" onClick={copyLink}><Icon name="copy" size={16} />Copy link</button><button className="lb-quiet-button" disabled={!rows.length} onClick={() => saveCSV(resultsCSV(rows, view, columns), `robovalue-${view.track}-${view.condition}-results.csv`)}><Icon name="down" size={16} />Export CSV</button></div></div>
        <p className="lb-track-description">{view.track === 'zero' ? 'Released checkpoints, without task-specific adaptation or reference demonstrations.' : 'One standard-scenario training demonstration per task, used for conditioning or task-specific adaptation; test trajectories remain separate.'}</p>
        {!ranked && <div className="lb-capability-tabs" role="group" aria-label="Capability dimension"><button aria-pressed={view.capability === 'all'} onClick={() => update({ capability: 'all', sort: null })}>All capabilities</button>{GROUPS.map(group => <button key={group.id} aria-pressed={view.capability === group.id} style={{ '--group-color': group.color }} onClick={() => update({ capability: group.id, sort: null })}><i />{group.short}</button>)}</div>}
        <div className="lb-table-status"><span aria-live="polite">{error ? 'Results unavailable' : data ? `${rows.length} of ${eligible.length} configurations · ${TRACKS[view.track]}` : 'Loading results…'}</span><button className="lb-reset" disabled={!view.sort && !view.query} onClick={() => update({ sort: null, query: '' })}>{view.sort ? `Sorted by ${METRICS[view.sort.key].label} ${view.sort.asc ? 'ascending' : 'descending'} · Reset` : view.query ? 'Clear search' : ranked ? 'Overall rank · Click column names to sort' : 'Paper order · Click column names to sort'}</button></div>
        <div className="lb-table-scroll" tabIndex={0} role="region" aria-label="Scrollable leaderboard results"><table className={`lb-table ${ranked ? 'lb-table-aggregate' : 'lb-table-metrics'} ${groups.length === 1 ? 'lb-table-focused' : ''}`}><caption className="sr-only">RoboValue {CONDITIONS[view.condition]}, {TRACKS[view.track]}. Select up to three models to compare capability profiles. Scores ×100. FPL: lower is better; other metrics: higher is better. Rank is the original overall rank within this track and is preserved when sorting or filtering.</caption>
          <thead><tr className="lb-group-row">{ranked && <th rowSpan={2} scope="col" className="lb-rank">Rank</th>}<th rowSpan={2} scope="col" className="lb-model">Model <span className="lb-model-hint">Select to compare</span></th>{groups.map(group => <th key={group.id} colSpan={group.metrics.length} scope="colgroup" style={{ '--group-color': group.color || '#6952bf' }}>{group.short}</th>)}</tr><tr className="lb-metric-row">{columns.map(key => <th key={key} scope="col" aria-sort={view.sort?.key === key ? view.sort.asc ? 'ascending' : 'descending' : 'none'} style={{ '--group-color': GROUPS.find(group => group.metrics.includes(key) || group.id === key)?.color || '#6952bf' }}><div><button className="lb-sort-button" onClick={() => sortBy(key)} title={`Sort by ${METRICS[key].name}`}><span>{METRICS[key].label}</span><span className="lb-direction" aria-label={METRICS[key].lower ? 'lower is better' : 'higher is better'}>{METRICS[key].lower ? '↓' : '↑'}</span>{view.sort?.key === key && <span className="lb-sort-indicator" aria-hidden="true">{view.sort.asc ? '▲' : '▼'}</span>}</button><button className="lb-info-button" aria-label={`About ${METRICS[key].label}`} onClick={() => setHelp(key)}>i</button></div></th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.id} className={view.selected.includes(row.id) ? 'lb-selected-row' : ''}>{ranked && <td className="lb-rank"><span className={row.aggregate.rank <= 3 ? `lb-rank-badge lb-rank-${row.aggregate.rank}` : ''}>{row.aggregate.rank}</span></td>}<th scope="row" className="lb-model"><label className="lb-model-select"><input type="checkbox" checked={view.selected.includes(row.id)} disabled={selected.length >= 3 && !view.selected.includes(row.id)} aria-label={`Compare ${modelName(row)}`} onChange={() => toggleSelection(row.id)} /><span><span className="lb-model-name">{row.name}{row.preview && <sup>†</sup>}{row.name === 'TOPReward' && <sup>‡</sup>}</span>{row.preview && <span className="lb-preview">2.0 Preview</span>}</span></label></th>{columns.map(key => <td key={key} style={{ '--group-color': GROUPS.find(group => group.metrics.includes(key) || group.id === key)?.color || '#6952bf' }}><Score value={scoreValue(row, view.condition, key)} highlight={highlights[key]} excluded={excludedHighlight(row, key)} overall={key === 'overall'} /></td>)}</tr>)}{!rows.length && <tr><td colSpan={columns.length + 1 + Number(ranked)} className="lb-empty">{error ? <><strong>Results could not be loaded.</strong><button className="lb-quiet-button" onClick={() => setAttempt(value => value + 1)}>Try again</button></> : data ? <><strong>No models match “{view.query}”.</strong><button className="lb-quiet-button" onClick={() => update({ query: '' })}>Clear search</button></> : 'Loading manuscript results…'}</td></tr>}</tbody>
        </table></div>
        <div className="lb-table-legend"><div><span><b className="lb-best">Best</b></span><span><b className="lb-second">Second best</b></span><span>— Not reported</span></div><span>All scores ×100 · FPL ↓ · Other metrics ↑</span></div>
        <div className="lb-selection-toolbar"><span><strong>{selected.length}/3</strong> models selected for comparison</span><button className="lb-quiet-button" disabled={!selected.length} onClick={() => comparisonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })}>View comparison <Icon size={16} /></button></div>
      </div>
      <div className="lb-result-notes"><p>† Robo-Dopamine 2.0 Preview. ‡ Qwen3-VL-8B backbone. Best and second-best marks are computed within the full selected track, including models hidden by search; tied values share the same mark.</p>{ranked ? <p>Ranks and aggregate scores reproduce Table 1. RoboReward’s VS and CSVC are unmeasured and count as zero in aggregate scoring.</p> : <><p>§ TOPReward’s high VOC and Memory-VOC coexist with weak reversal tracking; these entries are excluded from best and second-best marking, following the manuscript.</p>{view.condition !== 'id' && <p>TRR and CSVC are evaluated only in ID and are not reported under the distribution shifts in Table 3.</p>}</>}<p>Source: {ranked ? 'Table 1 · RoboValue Leaderboard' : view.condition === 'id' ? 'Table 2 · Main Results' : 'Table 3 · Generalization Results'} · Manuscript snapshot {data?.sourceVersion || '2026-10-07'}. Both simulation and real-world domains receive equal weight.</p></div>
      <p className="lb-copy-notice" role="status">{notice}</p>
    </section>
    <div ref={comparisonRef} className="lb-comparison-anchor"><ModelComparison rows={selected} onRemove={toggleSelection} onClear={() => update({ selected: [] })} /></div>
    {data && <PaperFindings rows={eligible} track={view.track} onExplore={explore} />}
    <ScoringGuide />
    <SubtaskResults track={view.track} />
    <footer className="lb-footer"><span>RoboValue · Fine-grained evaluation of robotic value models</span><a href="/doc/get-started/protocol/">Protocol and metrics <Icon size={16} /></a></footer>
    <MetricHelp metric={help} onClose={() => setHelp(null)} />
  </main>;
}
