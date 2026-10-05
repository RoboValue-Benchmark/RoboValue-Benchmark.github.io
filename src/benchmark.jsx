import React, { useEffect, useMemo, useRef, useState } from 'react';

const GROUPS = [
  { id: 'understanding', short: 'Understanding', title: 'Task-State Understanding', question: 'Does it understand the task?', description: 'Distinguish successful execution and ground values in the intended instruction.', color: '#6754bf', metrics: ['sa', 'tga_ct', 'tga_cf'] },
  { id: 'tracking', short: 'Tracking', title: 'Temporal Progress Monitoring', question: 'Does it track what happened?', description: 'Recognize progress, regression, and similar states with different execution histories.', color: '#267d91', metrics: ['voc', 'cycle_voc', 'memory_voc'] },
  { id: 'diagnosis', short: 'Diagnosis', title: 'Failure and Recovery Reasoning', question: 'Does it recognize a failure?', description: 'Locate execution errors and distinguish recovery attempts from successful recovery.', color: '#ba6a40', metrics: ['fpl', 'trr'] },
  { id: 'consistency', short: 'Consistency', title: 'Value Consistency', question: 'Can we rely on its feedback?', description: 'Assess stability along trajectories and consistent subtask gains across valid solutions.', color: '#437858', metrics: ['vs', 'csvc'] },
];
const METRICS = {
  sa: { label: 'SA', name: 'Success Accuracy', description: 'Ranks successful episodes above partially successful and failed episodes within each task and evaluation condition.' },
  tga_ct: { label: 'TGA-CT', name: 'Task Grounding · Cross-Task', description: 'Tests whether value gain is greater under the correct instruction than under instructions from other tasks.' },
  tga_cf: { label: 'TGA-CF', name: 'Task Grounding · Counterfactual', description: 'Tests whether value gain distinguishes the intended instruction from changes to objects, actions, placement, or constraints.' },
  voc: { label: 'VOC', name: 'Value-Order Correlation', description: 'Measures Spearman correlation between predicted values and temporal order along expert trajectories.' },
  cycle_voc: { label: 'Cycle-VOC', name: 'Cycle-VOC', description: 'Evaluates an expert trajectory followed by its reverse to test both progress and regression tracking.' },
  memory_voc: { label: 'Memory-VOC', name: 'Memory-VOC', description: 'Evaluates progress tracking when visually similar observations recur with different task-relevant histories.' },
  fpl: { label: 'FPL', name: 'Failure-Point Localization', lower: true, description: 'Measures normalized temporal error between the annotated failure onset and the onset predicted from value declines. Lower is better.' },
  trr: { label: 'TRR', name: 'Trajectory Recovery Reasoning', description: 'Tests appropriate value trends through failure, continued error, recovery attempts, and recovery outcomes.' },
  vs: { label: 'VS', name: 'Value Stability', description: 'Assesses consistent value trends along expert trajectories while discounting apparent stability from prolonged flat predictions. Combines the efficiency ratio with non-flat time coverage.' },
  csvc: { label: 'CSVC', name: 'Cross-Solution Value Consistency', description: 'Compares the gains assigned to the same semantic subtask across different valid execution orders.' },
};
const AGGREGATE_COLUMNS = ['overall', 'understanding', 'tracking', 'diagnosis', 'consistency'];
METRICS.overall = { label: 'Overall', name: 'Overall score', description: 'Mean of the four capability scores, computed before rounding.' };
for (const group of GROUPS) METRICS[group.id] = { label: group.short, name: group.title, description: group.title + ' aggregate score from Table 1.' };
const scoreValue = (row, condition, key) => condition === 'aggregate' ? row.aggregate?.[key] : row.conditions[condition][key];
const excludedHighlight = (row, key) => row.name === 'TOPReward' && ['voc', 'memory_voc'].includes(key);
const CONDITIONS = { aggregate: 'Overall Ranking', id: 'Standard (ID)', emb: 'Cross-Embodiment', env: 'Cross-Environment' };

function Icon({ name = 'arrow', size = 18, ...props }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    down: <><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" /></>,
    paper: <><path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8M8 16h8" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V3H3v13h5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function Figure({ src, alt, caption, className = '' }) {
  const dialog = useRef(null);
  return <figure className={`paper-figure ${className}`}>
    <button className="figure-open" onClick={() => dialog.current.showModal()} aria-label={`Enlarge: ${alt}`}>
      <img src={src} alt={alt} loading="lazy" /><span className="expand"><Icon name="expand" /> Enlarge figure</span>
    </button>
    {caption && <figcaption>{caption}</figcaption>}
    <dialog ref={dialog} className="figure-dialog" onClick={e => { if (e.target === e.currentTarget) dialog.current.close(); }}>
      <button className="close-dialog" aria-label="Close figure" onClick={() => dialog.current.close()}><Icon name="close" /></button>
      <img src={src} alt={alt} /><p>{caption}</p>
    </dialog>
  </figure>;
}

function SectionTitle({ eyebrow, title, children }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children && <p className="section-description">{children}</p>}</div>;
}

function downloadCSV(rows, condition, columns) {
  const escape = value => `"${String(value).replaceAll('"', '""')}"`;
  const data = [['Model', 'Setting', 'Condition', ...columns.map(k => METRICS[k].label)], ...rows.map(row => [row.name + (row.preview ? ' (2.0 Preview)' : ''), row.setting === 'zero' ? 'Zero-shot' : 'One-shot', CONDITIONS[condition], ...columns.map(k => scoreValue(row, condition, k) ?? '')])];
  const url = URL.createObjectURL(new Blob([data.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = `robovalue-${condition}-results.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Leaderboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [condition, setCondition] = useState('aggregate');
  const [setting, setSetting] = useState('zero');
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null);
  useEffect(() => { let alive = true; fetch('/data/results.json').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(d => { if (alive) setData(d); }).catch(() => { if (alive) setError(true); }); return () => { alive = false; }; }, []);
  const groups = condition === 'aggregate' ? [{ id: 'aggregate', short: 'Capability scores', color: '#6754bf', metrics: AGGREGATE_COLUMNS }] : GROUPS.filter(g => group === 'all' || group === g.id).map(g => ({ ...g, metrics: g.metrics.filter(k => condition === 'id' || !['trr', 'csvc'].includes(k)) }));
  const columns = groups.flatMap(g => g.metrics);
  const eligible = useMemo(() => (data?.rows ?? []).filter(r => r.setting === setting), [data, setting]);
  const rows = useMemo(() => {
    const filtered = eligible.filter(r => `${r.name} ${r.preview ? '2.0 preview' : ''}`.toLowerCase().includes(query.toLowerCase().trim()));
    if (sort) filtered.sort((a, b) => { const av = scoreValue(a, condition, sort.key), bv = scoreValue(b, condition, sort.key); if (av == null) return bv == null ? a.order - b.order : 1; if (bv == null) return -1; return (sort.asc ? av - bv : bv - av) || a.order - b.order; });
    else if (condition === 'aggregate') filtered.sort((a, b) => a.aggregate.rank - b.aggregate.rank);
    return filtered;
  }, [eligible, query, sort, condition]);
  const best = Object.fromEntries(columns.map(k => { const vals = eligible.filter(r => !excludedHighlight(r, k)).map(r => scoreValue(r, condition, k)).filter(v => v != null); return [k, vals.length ? (METRICS[k].lower ? Math.min(...vals) : Math.max(...vals)) : null]; }));
  const changeGroup = value => { setGroup(value); setSort(null); };
  const changeCondition = value => { setCondition(value); setSort(null); };
  return <section id="leaderboard" className="leaderboard-section section">
    <div className="wrap wide">
      <SectionTitle eyebrow="RESULTS" title="Compare model performance.">Results from the paper under zero-shot and one-shot settings, covering in-domain evaluation and shifts in robot embodiment or environment.</SectionTitle>
      <div className="board">
        <div className="board-top"><div className="condition-tabs" role="group" aria-label="Evaluation condition">{Object.entries(CONDITIONS).map(([key, text]) => <button key={key} aria-pressed={condition === key} onClick={() => changeCondition(key)}>{text}</button>)}</div><span className="paper-version">PAPER RESULTS</span></div>
        <div className="board-controls"><div className="setting-switch" role="group" aria-label="Evaluation setting">{[['zero', 'Zero-shot'], ['one', 'One-shot']].map(([key, label]) => <button key={key} onClick={() => setSetting(key)} aria-pressed={setting === key}>{label}</button>)}</div><label className="search"><Icon name="search" /><input type="search" placeholder="Find a model…" aria-label="Find a model" value={query} onChange={e => setQuery(e.target.value)} /></label><button className="text-button download" disabled={!data || rows.length === 0} onClick={() => downloadCSV(rows, condition, columns)}><Icon name="down" size={16} /> Export CSV</button></div>
        {condition !== 'aggregate' && <div className="dimension-tabs" role="group" aria-label="Capability dimension"><button aria-pressed={group === 'all'} onClick={() => changeGroup('all')}>All capabilities</button>{GROUPS.map(g => <button key={g.id} aria-pressed={group === g.id} style={{ '--group-color': g.color }} onClick={() => changeGroup(g.id)}><span />{g.short}</button>)}</div>}
        <div className="table-status"><span aria-live="polite">{data ? `${rows.length} models · ${CONDITIONS[condition]} · ${setting === 'zero' ? 'Zero-shot' : 'One-shot'}` : 'Loading results…'}</span><button className="text-button" onClick={() => setSort(null)} disabled={!sort}>{sort ? `Sorted by ${METRICS[sort.key].label} ${sort.asc ? '↑ ascending' : '↓ descending'} · Reset` : (condition === 'aggregate' ? 'Overall rank · Click a score to sort' : 'Paper order · Click a metric to sort')}</button></div>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Scrollable leaderboard results">
          <table className={group === 'all' ? 'results-table' : 'results-table focused'}>
            <caption className="sr-only">RoboValue {CONDITIONS[condition]}, {setting === 'zero' ? 'zero-shot' : 'one-shot'} results. Scores use the paper’s ×100 scale. FPL: lower is better; all other metrics: higher is better.</caption>
            <thead><tr className="group-header"><th rowSpan={2} scope="col" className="model-cell">Model</th>{groups.map(g => <th key={g.id} colSpan={g.metrics.length} scope="colgroup" style={{ '--group-color': g.color }}>{g.short}</th>)}</tr><tr className="metric-header">{columns.map(k => <th key={k} scope="col" aria-sort={sort?.key === k ? (sort.asc ? 'ascending' : 'descending') : 'none'}><button title={`${METRICS[k].name}: ${METRICS[k].description}`} onClick={() => setSort(s => ({ key: k, asc: s?.key === k ? !s.asc : !!METRICS[k].lower }))}>{METRICS[k].label}<span>{METRICS[k].lower ? '↓' : '↑'}</span></button></th>)}</tr></thead>
            <tbody>{rows.map(row => <tr key={row.id}><th className="model-cell" scope="row">{row.name}{row.preview && <sup title="Robo-Dopamine 2.0 Preview">†</sup>}{row.name === 'TOPReward' && <sup title="Qwen3-VL-8B backbone">‡</sup>}{row.preview && <span className="preview-badge">2.0 Preview</span>}</th>{columns.map(k => { const value = scoreValue(row, condition, k); const g = GROUPS.find(g => g.metrics.includes(k) || g.id === k) ?? { color: '#6754bf' }; return <td key={k} className={`${value === best[k] && value != null && !excludedHighlight(row, k) ? 'best-score' : ''} ${value == null ? 'missing' : ''}`} style={{ '--group-color': g.color }}><span>{value == null ? '—' : value.toFixed(2)}{row.name === 'TOPReward' && ['voc', 'memory_voc'].includes(k) && <sup title="See the timestamp-sensitivity note below">§</sup>}</span></td>; })}</tr>)}{!rows.length && <tr><td colSpan={columns.length + 1} className="empty-state">{error ? <>Results could not be loaded. Please reload this page.</> : data ? 'No models match your search.' : 'Loading the paper results…'}</td></tr>}</tbody>
          </table>
        </div>
        <div className="board-footer"><span><i /> Bold scores mark the best result within the selected setting.</span><span>All scores ×100 · FPL ↓ · Other metrics ↑</span></div>
      </div>
      <div className="leaderboard-notes">
        <p>† Robo-Dopamine 2.0 Preview. ‡ Qwen3-VL-8B backbone. — Result not reported.</p>
        {condition === 'aggregate' ? <><p>Scores reproduce Table 1. Overall is the mean of the four capability scores. RoboReward is excluded from VS and CSVC because of its discrete outputs; both contribute zero to aggregate scoring.</p><details className="scoring-details"><summary>How aggregate scores are computed</summary><p>Following Appendix F.3, VOC, Memory-VOC, VROC and CSVC are normalized as (x + 100) / 2; FPL as 100 − x. Other metrics retain their percentage scores. Metrics reported in ID and OOD use weights of 1/2, 1/4 and 1/4 for ID, cross-embodiment and cross-environment; TRR and CSVC use ID only. Missing metrics contribute zero after normalization.</p><p>Understanding gives equal weight to SA and the mean of TGA-CT and TGA-CF. Tracking gives half its weight to the mean of VOC and Memory-VOC and half to VROC, the reverse-half correlation with forward context retained. VROC is averaged equally across the three conditions; Cycle-VOC is not added separately. Diagnosis averages normalized FPL and TRR; Consistency averages VS and normalized CSVC. SIA is reported separately.</p></details></> : <><p>§ High forward correlation coexists with weak reversal tracking in TOPReward; its VOC and Memory-VOC entries are excluded from best-score highlighting, following the paper.</p>{condition !== 'id' && <p>TRR and CSVC are not reported under distribution shifts in Table 3.</p>}</>}
        <p>Source: {condition === 'aggregate' ? 'Table 1 · RoboValue Leaderboard' : condition === 'id' ? 'Table 2 · Main Results' : 'Table 3 · Generalization Results'} · Public manuscript, October 5, 2026.</p>
      </div>
    </div>
  </section>;
}

const EXAMPLES = [
  { id: 'cycle', label: 'Progress & regression', metric: 'CYCLE-VOC', title: 'Tracking progress and regression.', description: 'An expert trajectory is followed by its reversed sequence. A reliable value model should respond to task regression, even though presentation time keeps increasing.', files: ['pen-1', 'pen-2', 'pen-3', 'pen-2', 'pen-1'], labels: ['Forward', 'Forward', 'Turning point', 'Reverse', 'Reverse'], task: 'Fill pen holder · Simulation', question: 'Does the value track execution direction?' },
  { id: 'memory', label: 'Execution history', metric: 'MEMORY-VOC', title: 'Tracking progress through repeated actions.', description: 'Repeated actions bring the robot back to visually similar states. The current image alone may not reveal how much of the requested sequence has been completed.', files: ['button-1', 'button-2', 'button-3', 'button-4', 'button-5'], labels: ['2.24 s', '3.00 s', '3.72 s', '4.48 s', '5.08 s'], task: 'Press by number · Simulation', question: 'Does the model remember the completed actions?' },
  { id: 'recovery', label: 'Failure & recovery', metric: 'TRR', title: 'Distinguishing recovery attempts from outcomes.', description: 'This example shows an execution error, an unsuccessful recovery attempt, and a transition to the next subtask. TRR tests whether value changes reflect the failure, attempt, and outcome.', files: ['fold-1', 'fold-2', 'fold-3', 'fold-4', 'fold-5'], labels: ['Before failure', 'After failure', 'Recovery attempt', 'Recovery fails', 'Next subtask'], task: 'Fold clothes · Simulation', question: 'Does the value reflect the recovery outcome?' },
];

function Diagnostics() {
  const [selected, setSelected] = useState('cycle');
  const e = EXAMPLES.find(e => e.id === selected);
  return <section id="diagnostics" className="section wrap">
    <SectionTitle eyebrow="TRAJECTORY EXAMPLES" title="A closer look at execution.">Three examples illustrate how RoboValue tests progress reversal, execution history, and recovery outcomes.</SectionTitle>
    <div className="example-tabs" role="group" aria-label="Diagnostic example">{EXAMPLES.map(e => <button key={e.id} aria-pressed={e.id === selected} onClick={() => setSelected(e.id)}>{e.label}</button>)}</div>
    <div className="example-panel"><div className="example-intro"><span className="mini-label">{e.metric}</span><h3>{e.title}</h3><p>{e.description}</p></div><div className="filmstrip">{e.files.map((file, i) => <figure key={`${selected}-${i}`}><img src={`/assets/${file}.png`} loading="lazy" alt={`${e.task}: ${e.labels[i]}`} /><figcaption><span>0{i + 1}</span>{e.labels[i]}</figcaption></figure>)}</div><div className="example-footer"><span>{e.task}</span><strong>{e.question}</strong></div></div>
  </section>;
}

function Protocol() {
  return <section id="protocol" className="section wrap"><SectionTitle eyebrow="EVALUATION" title="Protocol and metrics.">Model-specific adapters provide shared scalar, pairwise, and textual interfaces while preserving each model’s native value semantics.</SectionTitle>
    <div className="setting-explainer"><div><span>ZERO-SHOT</span><p>Released checkpoints, without task-specific adaptation or reference demonstrations.</p></div><div><span>ONE-SHOT</span><p>One demonstration per task, excluded from evaluation, used for conditioning or task-specific adaptation.</p></div><div><span>GENERALIZATION</span><p>Change the embodiment or environment without further adaptation to the shifted condition.</p></div></div>
    <Figure className="protocol-figure" src="/assets/overview.png" alt="RoboValue evaluation framework with shared interfaces and four capability dimensions" caption="Shared scalar, pairwise, and textual interfaces connect diverse value models to a unified diagnostic protocol." />
    <div className="metric-guide">{GROUPS.map(g => <div className="metric-family" key={g.id} style={{ '--group-color': g.color }}><h3>{g.title}</h3>{g.metrics.map(k => <details id={`metric-${k}`} key={k}><summary><span className="metric-symbol">{METRICS[k].label} {METRICS[k].lower ? '↓' : '↑'}</span><span>{METRICS[k].name}</span><span className="plus">+</span></summary><p>{METRICS[k].description}</p></details>)}</div>)}</div>
    <p className="protocol-note">Metric definitions appear in Section 4.3; aggregate scoring is specified in Appendix F.3. Subtask Identification Accuracy (SIA) is reported separately and is not included in the aggregate leaderboard.</p>
  </section>;
}



export { GROUPS, Figure, Icon, Leaderboard, Diagnostics, Protocol };
