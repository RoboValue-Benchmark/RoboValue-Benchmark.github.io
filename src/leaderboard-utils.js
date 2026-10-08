import { AGGREGATE_COLUMNS, CONDITIONS, GROUPS, METRICS, excludedHighlight, scoreValue } from './benchmark-metrics';

export const TRACKS = { zero: 'Zero-shot', one: 'One-shot' };
export const DEFAULT_VIEW = { condition: 'aggregate', track: 'zero', capability: 'all', query: '', sort: null, selected: [] };
const VIEW_PARAMS = ['condition', 'track', 'capability', 'q', 'sort', 'direction', 'compare'];

export function metricGroups(condition, capability = 'all') {
  if (condition === 'aggregate') return [{ id: 'aggregate', short: 'Capability scores', metrics: AGGREGATE_COLUMNS }];
  return GROUPS.filter(group => capability === 'all' || capability === group.id).map(group => ({
    ...group, metrics: group.metrics.filter(key => condition === 'id' || !['trr', 'csvc'].includes(key)),
  }));
}

export function readView(search) {
  const params = new URLSearchParams(search);
  const condition = Object.hasOwn(CONDITIONS, params.get('condition')) ? params.get('condition') : 'aggregate';
  const track = Object.hasOwn(TRACKS, params.get('track')) ? params.get('track') : 'zero';
  const capability = GROUPS.some(group => group.id === params.get('capability')) ? params.get('capability') : 'all';
  const key = params.get('sort');
  const validSort = metricGroups(condition, capability).some(group => group.metrics.includes(key));
  return {
    condition, track, capability, query: (params.get('q') || '').slice(0, 100),
    sort: validSort ? { key, asc: params.get('direction') === 'asc' } : null,
    selected: [...new Set((params.get('compare') || '').split(',').filter(id => /^[a-z0-9-]+$/.test(id)))].slice(0, 3),
  };
}

export function viewURL(view, location) {
  const url = new URL(location);
  VIEW_PARAMS.forEach(key => url.searchParams.delete(key));
  if (view.condition !== 'aggregate') url.searchParams.set('condition', view.condition);
  if (view.track !== 'zero') url.searchParams.set('track', view.track);
  if (view.capability !== 'all') url.searchParams.set('capability', view.capability);
  if (view.query) url.searchParams.set('q', view.query);
  if (view.sort) { url.searchParams.set('sort', view.sort.key); url.searchParams.set('direction', view.sort.asc ? 'asc' : 'desc'); }
  if (view.selected.length) url.searchParams.set('compare', view.selected.join(','));
  return url;
}

export const modelName = row => row.preview ? row.name.replace('Robo-Dopamine-', 'Robo-Dopamine 2.0-') + ' Preview' : row.name;

export function sortedRows(rows, view) {
  const query = view.query.toLowerCase().trim();
  const filtered = rows.filter(row => `${row.name} ${modelName(row)}`.toLowerCase().includes(query));
  if (!view.sort) return filtered.sort((a, b) => view.condition === 'aggregate' ? a.aggregate.rank - b.aggregate.rank : a.order - b.order);
  return filtered.sort((a, b) => {
    const av = scoreValue(a, view.condition, view.sort.key), bv = scoreValue(b, view.condition, view.sort.key);
    if (av == null) return bv == null ? a.order - b.order : 1;
    if (bv == null) return -1;
    return (view.sort.asc ? av - bv : bv - av) || a.order - b.order;
  });
}

export function scoreHighlights(rows, condition, columns) {
  return Object.fromEntries(columns.map(key => {
    const values = [...new Set(rows.filter(row => !excludedHighlight(row, key)).map(row => scoreValue(row, condition, key)).filter(value => value != null))];
    values.sort((a, b) => METRICS[key].lower ? a - b : b - a);
    return [key, { best: values[0], second: values[1] }];
  }));
}

export function resultsCSV(rows, view, columns) {
  const ranked = view.condition === 'aggregate';
  const header = ['Model', 'Track', 'Condition', ...(ranked ? ['Rank'] : []), ...columns.map(key => METRICS[key].label)];
  const values = rows.map(row => [modelName(row), TRACKS[row.setting], CONDITIONS[view.condition], ...(ranked ? [row.aggregate.rank] : []), ...columns.map(key => scoreValue(row, view.condition, key) ?? '')]);
  const escape = value => `"${String(value).replaceAll('"', '""')}"`;
  return [header, ...values].map(row => row.map(escape).join(',')).join('\r\n');
}
