import test from 'node:test';
import assert from 'node:assert/strict';
import { readLeaderboardViews, leaderboardViewsURL } from './leaderboard-state.mjs';

const columns = { rankingKeys: ['overall', 'understanding'], resultKeys: { id: ['sa', 'fpl', 'trr', 'sia'], emb: ['sa', 'fpl', 'sia'], env: ['sa', 'fpl', 'sia'] } };
const read = search => readLeaderboardViews(search, columns);

test('six tables default to independent Standard views without a sort', () => {
  const views = read('');
  assert.deepEqual(Object.keys(views.ranking), ['zero', 'one', 'full']);
  for (const track of Object.keys(views.results)) assert.deepEqual(views.results[track], { condition: 'id', sort: null });
  assert.notEqual(views.results.zero, views.results.one);
});

test('old result and ranking links retain their separate target tracks', () => {
  const views = read('?track=one&condition=emb&sort=fpl&direction=asc&ranking-track=zero&ranking-sort=overall&ranking-direction=desc');
  assert.deepEqual(views.results.one, { condition: 'emb', sort: { key: 'fpl', asc: true } });
  assert.deepEqual(views.ranking.zero, { sort: { key: 'overall', asc: false } });
  assert.deepEqual(views.results.zero, { condition: 'id', sort: null });
  assert.equal(views.ranking.one.sort, null);
});

test('legacy aggregate sorts apply to rankings rather than raw metric tables', () => {
  const views = read('?track=one&condition=aggregate&sort=overall&direction=asc');
  assert.deepEqual(views.ranking.one.sort, { key: 'overall', asc: true });
  assert.equal(views.results.one.sort, null);
});

test('all six views survive a URL round trip with unrelated parameters and hash', () => {
  const views = read('');
  views.ranking.zero.sort = { key: 'overall', asc: true };
  views.ranking.one.sort = { key: 'understanding', asc: false };
  views.results.zero = { condition: 'emb', sort: { key: 'fpl', asc: true } };
  views.results.one = { condition: 'env', sort: { key: 'sia', asc: false } };
  views.results.full.condition = 'env';
  const url = leaderboardViewsURL(views, 'https://example.com/leaderboard/?utm_source=test&track=one&sort=sa#lb-results-one-title');
  assert.equal(url.searchParams.get('utm_source'), 'test');
  assert.equal(url.hash, '#lb-results-one-title');
  assert.equal(url.searchParams.has('track'), false);
  assert.deepEqual(read(url.search), views);
});

test('invalid conditions and unsupported metric sorts fall back safely', () => {
  const views = read('?results-zero=evil&results-zero-sort=trr&results-one=emb&results-one-sort=trr&ranking-full-sort=fpl');
  assert.deepEqual(views.results.zero, { condition: 'id', sort: { key: 'trr', asc: false } });
  assert.deepEqual(views.results.one, { condition: 'emb', sort: null });
  assert.equal(views.ranking.full.sort, null);
});

test('reset views remove stale independent parameters and legacy fallbacks', () => {
  const url = leaderboardViewsURL(read(''), 'https://example.com/leaderboard/?condition=env&sort=fpl&results-one=emb&results-one-sort=sa&results-one-direction=asc');
  assert.equal(url.search, '');
  assert.deepEqual(read(url.search), read(''));
});
