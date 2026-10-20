const TRACKS = ['zero', 'one', 'full'];
const LEGACY_PARAMS = ['condition', 'track', 'capability', 'q', 'sort', 'direction', 'compare', 'ranking-track', 'ranking-sort', 'ranking-direction'];
const trackOr = (value, fallback) => TRACKS.includes(value) ? value : fallback;

function validSort(key, direction, keys) {
  return keys.includes(key) ? { key, asc: direction === 'asc' } : null;
}

// Accept old shared-table links while giving each of the six tables its own
// state. Metric keys come from the rendered columns, including SIA.
export function readLeaderboardViews(search, { rankingKeys, resultKeys }) {
  const params = new URLSearchParams(search);
  const legacyTrack = trackOr(params.get('track'), 'zero');
  const legacyRankingTrack = trackOr(params.get('ranking-track'), legacyTrack);
  const legacyCondition = Object.hasOwn(resultKeys, params.get('condition')) ? params.get('condition') : 'id';
  const legacyAggregate = !params.has('condition') || params.get('condition') === 'aggregate';
  const legacyRankingSort = validSort(params.get('ranking-sort'), params.get('ranking-direction'), rankingKeys)
    || (legacyAggregate ? validSort(params.get('sort'), params.get('direction'), rankingKeys) : null);
  return Object.fromEntries(['ranking', 'results'].map(kind => [kind, Object.fromEntries(TRACKS.map(track => {
    const prefix = `${kind}-${track}`;
    const legacySelected = track === (kind === 'ranking' ? legacyRankingTrack : legacyTrack);
    const rawCondition = params.has(prefix) ? params.get(prefix) : legacySelected ? legacyCondition : 'id';
    const condition = Object.hasOwn(resultKeys, rawCondition) ? rawCondition : 'id';
    const keys = kind === 'ranking' ? rankingKeys : resultKeys[condition];
    const fallbackSort = kind === 'ranking' ? legacyRankingSort
      : !legacyAggregate ? validSort(params.get('sort'), params.get('direction'), keys) : null;
    const sort = params.has(`${prefix}-sort`)
      ? validSort(params.get(`${prefix}-sort`), params.get(`${prefix}-direction`), keys)
      : legacySelected ? fallbackSort : null;
    return [track, kind === 'ranking' ? { sort } : { condition, sort }];
  }))]));
}

export function leaderboardViewsURL(views, location) {
  const url = new URL(location);
  LEGACY_PARAMS.forEach(key => url.searchParams.delete(key));
  for (const kind of ['ranking', 'results']) for (const track of TRACKS) {
    const prefix = `${kind}-${track}`;
    const view = views[kind][track];
    url.searchParams.delete(prefix);
    url.searchParams.delete(`${prefix}-sort`);
    url.searchParams.delete(`${prefix}-direction`);
    if (kind === 'results' && view.condition !== 'id') url.searchParams.set(prefix, view.condition);
    if (view.sort) {
      url.searchParams.set(`${prefix}-sort`, view.sort.key);
      url.searchParams.set(`${prefix}-direction`, view.sort.asc ? 'asc' : 'desc');
    }
  }
  return url;
}
