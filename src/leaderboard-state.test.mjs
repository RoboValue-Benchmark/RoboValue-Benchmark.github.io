import test from 'node:test';
import assert from 'node:assert/strict';
import { readLeaderboardViews, leaderboardViewsURL } from './leaderboard-state.mjs';
const columns = { rankingKeys: ['overall', 'understanding'], resultKeys: { id: ['sa', 'fpl', 'trr', 'sia'], emb: ['sa', 'fpl', 'sia'], env: ['sa', 'fpl', 'sia'] } };
const read = search => readLeaderboardViews(search, columns);
test('unified tables default to Overall order with Standard results', () => {
  assert.deepEqual(read(''), { ranking: { sort: null }, results: { condition: 'id', sort: null } });
});
test('legacy single-table result and ranking sorts remain independent', () => {
  assert.deepEqual(read('?track=one&condition=emb&sort=fpl&direction=asc&ranking-sort=overall&ranking-direction=desc'), {
    ranking: { sort: { key: 'overall', asc: false } }, results: { condition: 'emb', sort: { key: 'fpl', asc: true } },
  });
});
test('legacy per-setting links use the explicitly selected setting when conflicting', () => {
  assert.deepEqual(read('?track=one&results-zero=emb&results-zero-sort=fpl&results-one=env&results-one-sort=sia&ranking-zero-sort=overall'), {
    ranking: { sort: { key: 'overall', asc: false } }, results: { condition: 'env', sort: { key: 'sia', asc: false } },
  });
});
test('ranking and result sorts and domain survive URL round trips', () => {
  const views = { ranking: { sort: { key: 'understanding', asc: true } }, results: { condition: 'env', sort: { key: 'sia', asc: false } } };
  const url = leaderboardViewsURL(views, 'https://example.com/leaderboard/?utm_source=test&track=one&results-full=emb&sort=sa#lb-results-title');
  assert.equal(url.searchParams.get('utm_source'), 'test');
  assert.equal(url.hash, '#lb-results-title');
  assert.equal(url.searchParams.has('track'), false);
  assert.equal(url.searchParams.has('results-full'), false);
  assert.deepEqual(read(url.search), views);
});
test('unsupported result metrics and invalid conditions do not leak between tables', () => {
  assert.deepEqual(read('?results=emb&results-sort=trr&ranking-sort=fpl'), { ranking: { sort: null }, results: { condition: 'emb', sort: null } });
  assert.deepEqual(read('?results=evil&results-sort=fpl&results-direction=asc').results, { condition: 'id', sort: { key: 'fpl', asc: true } });
});
test('reset clears obsolete URL state and aggregate sort never becomes a raw sort', () => {
  const url = leaderboardViewsURL(read(''), 'https://example.com/leaderboard/?condition=env&sort=fpl&results-one=emb&ranking-zero-sort=overall');
  assert.equal(url.search, '');
  assert.deepEqual(read('?condition=aggregate&sort=overall&direction=asc'), { ranking: { sort: { key: 'overall', asc: true } }, results: { condition: 'id', sort: null } });
});

test('legacy per-setting anchors resolve to the unified section', () => {
  const url = leaderboardViewsURL(read(''), 'https://example.com/leaderboard/#lb-results-one-title');
  assert.equal(url.hash, '#lb-results-title');
});
