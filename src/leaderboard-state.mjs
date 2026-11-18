const TRACKS = ['zero', 'one', 'full'];
const LEGACY_PARAMS = ['condition', 'track', 'capability', 'q', 'sort', 'direction', 'compare', 'ranking-track'];
const validSort = (key, direction, keys) => keys.includes(key) ? { key, asc: direction === 'asc' } : null;

// Old per-setting links resolve to one unified view. With conflicting old links,
// honor the explicitly selected setting, otherwise use zero/one/full priority.
export function readLeaderboardViews(search, { rankingKeys, resultKeys }) {
  const params = new URLSearchParams(search);
  const selected = TRACKS.includes(params.get('track')) ? params.get('track') : 'zero';
  const prefixes = kind => [`${kind}-${selected}`, ...TRACKS.filter(t => t !== selected).map(t => `${kind}-${t}`)];
  const legacyResults = prefixes('results').find(prefix => params.has(prefix) || params.has(`${prefix}-sort`));
  const legacyRanking = prefixes('ranking').find(prefix => params.has(`${prefix}-sort`));
  const rawCondition = params.get('results') ?? params.get(legacyResults) ?? params.get('condition');
  const condition = Object.hasOwn(resultKeys, rawCondition) ? rawCondition : 'id';
  const legacyAggregate = !params.has('condition') || params.get('condition') === 'aggregate';
  const sortFor = (kind, keys, prefix, fallback) => {
    if (params.has(`${kind}-sort`)) return validSort(params.get(`${kind}-sort`), params.get(`${kind}-direction`), keys);
    if (prefix) return validSort(params.get(`${prefix}-sort`), params.get(`${prefix}-direction`), keys);
    return fallback ? validSort(params.get('sort'), params.get('direction'), keys) : null;
  };
  return {
    ranking: { sort: sortFor('ranking', rankingKeys, legacyRanking, legacyAggregate) },
    results: { condition, sort: sortFor('results', resultKeys[condition], legacyResults, !legacyAggregate) },
  };
}

export function leaderboardViewsURL(views, location) {
  const url = new URL(location);
  LEGACY_PARAMS.forEach(key => url.searchParams.delete(key));
  for (const kind of ['ranking', 'results']) {
    for (const track of TRACKS) for (const suffix of ['', '-sort', '-direction']) url.searchParams.delete(`${kind}-${track}${suffix}`);
    for (const suffix of ['', '-sort', '-direction']) url.searchParams.delete(`${kind}${suffix}`);
    const view = views[kind];
    if (kind === 'results' && view.condition !== 'id') url.searchParams.set(kind, view.condition);
    if (view.sort) {
      url.searchParams.set(`${kind}-sort`, view.sort.key);
      url.searchParams.set(`${kind}-direction`, view.sort.asc ? 'asc' : 'desc');
    }
  }
  url.hash = url.hash.replace(/^#lb-(ranking|results)-(zero|one|full)-(title|table)$/, '#lb-$1-$3');
  return url;
}
