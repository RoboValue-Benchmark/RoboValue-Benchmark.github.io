import taskData from './data/tasks.json';
import { GROUPS, METRICS } from './benchmark-metrics.js';

export const protocolSections = {
  'evaluation-protocol': [
    ['protocol-settings', 'Evaluation Tracks'],
    ['protocol-conditions', 'Evaluation Conditions'],
    ['protocol-evaluation', 'Evaluation Procedure'],
    ['protocol-integrity', 'Evaluation Integrity'],
    ['protocol-results', 'Scoring'],
  ],
  metrics: [
    ...GROUPS.map(group => [`protocol-${group.id}`, group.title]),
    ['metric-notation', 'Shared Notation'],
  ],
};

const taskPages = domain => taskData.tasks.filter(task => task.domain === domain).map(task => ({
  path: `/doc/${domain}-tasks/${task.slug}/`, title: task.title, kind: 'task', taskId: task.id,
}));

export const metricPages = GROUPS.flatMap(group => {
  const keys = group.id === 'understanding' ? [...group.metrics, 'sia'] : group.metrics;
  return keys.map(key => ({
    path: `/doc/get-started/protocol/metrics/${key.replaceAll('_', '-')}/`,
    title: key === 'sia' ? 'SIA' : METRICS[key].label,
    kind: 'metric', metricKey: key, dimension: group.id, anchors: [`metric-${key}`],
  }));
});

export const metricDimensionPages = GROUPS.map(group => ({
  path: `/doc/get-started/protocol/metrics/${group.id}/`,
  title: group.title, kind: 'metric-dimension', dimension: group.id,
  children: metricPages.filter(page => page.dimension === group.id),
}));

export const navigation = [
  { title: 'Home', pages: [{ path: '/doc/', title: 'RoboValue', kind: 'home' }] },
  { title: 'Usage', pages: [
    { path: '/doc/get-started/', title: 'Quick Start', kind: 'start' },
    { path: '/doc/get-started/data/', title: 'Dataset', kind: 'dataset-guide', children: [
      { path: '/doc/get-started/data/overview/', title: 'Overview', kind: 'data', anchors: ['dataset-splits', 'dataset-test', 'dataset-observations', 'dataset-annotation'] },
      { path: '/doc/get-started/data/download/', title: 'Download', kind: 'data-download', anchors: ['dataset-training'] },
    ] },
    { path: '/doc/get-started/protocol/evaluation/', title: 'Evaluation Protocol', kind: 'evaluation-protocol', anchors: ['protocol-settings', 'protocol-conditions', 'protocol-evaluation', 'dataset-references', 'protocol-coverage', 'protocol-integrity', 'protocol-results'] },
    { path: '/doc/get-started/evaluation/', title: 'Evaluation Workflow', kind: 'evaluation', children: [
      { path: '/doc/get-started/adapters/', title: 'Submission', kind: 'submission' },
      { path: '/doc/model-api/', title: 'Adapter Guide', kind: 'integration' },
      { path: '/doc/get-started/evaluation/results/', title: 'Results', kind: 'evaluation-results' },
    ] },
  ] },
  { title: 'Metrics', pages: [{ path: '/doc/get-started/protocol/metrics/', title: 'Metrics', kind: 'metrics', anchors: ['metric-notation', ...GROUPS.map(group => `protocol-${group.id}`)], children: metricDimensionPages }] },
  { title: 'Simulation Tasks', pages: [
    { path: '/doc/simulation-tasks/', title: 'Overview', kind: 'simulation' },
    { path: '/doc/simulation-tasks/catalog/', title: 'Task Catalog', kind: 'catalog', domain: 'simulation' },
    ...taskPages('simulation'),
  ] },
  { title: 'Real-World Tasks', pages: [
    { path: '/doc/real-world-tasks/', title: 'Overview', kind: 'real' },
    { path: '/doc/real-world-tasks/catalog/', title: 'Task Catalog', kind: 'catalog', domain: 'real-world' },
    ...taskPages('real-world'),
  ] },
  { title: 'Diagnostic Trajectories', pages: [{ path: '/doc/diagnostic-trajectories/', title: 'Diagnostic Trajectories', kind: 'diagnostics', children: [
    { path: '/doc/diagnostic-trajectories/failure-and-recovery/', title: 'Failure and Recovery Trajectories', kind: 'diagnostic-category', category: 'diagnostic-failure-recovery', anchors: ['diagnostic-failure-recovery'] },
    { path: '/doc/diagnostic-trajectories/long-horizon/', title: 'Long-Horizon Temporal Trajectories', kind: 'diagnostic-category', category: 'diagnostic-long-horizon', anchors: ['diagnostic-long-horizon'] },
    { path: '/doc/diagnostic-trajectories/multi-solution/', title: 'Multi-Solution Trajectories', kind: 'diagnostic-category', category: 'diagnostic-multi-solution', anchors: ['diagnostic-multi-solution'] },
  ] }] },
];
function flattenPages(page, group, parent) {
  if (!page.path) return page.children.flatMap(child => flattenPages(child, group, parent));
  const current = { ...page, group, parent };
  return [current, ...(page.children ?? []).flatMap(child => flattenPages(child, group, current))];
}

export const navigationPages = navigation.flatMap(group => group.pages.flatMap(page => flattenPages(page, group.title)));
export const documentationPages = navigationPages.filter(page => page.path.startsWith('/doc/'));
export const pages = [
  { path: '/', title: 'RoboValue', kind: 'landing', group: 'Home' },
  { path: '/data/', title: 'Data', kind: 'data-release', group: 'Data' },
  { path: '/eval/', title: 'Eval', kind: 'evaluation-page', group: 'Eval' },
  ...navigationPages,
  { path: '/doc/get-started/protocol/', title: 'Protocol', kind: 'protocol', group: 'Usage' },
  { path: '/community/', title: 'Community', kind: 'community', group: 'Community' },
  { path: '/leaderboard/', title: 'Leaderboard', kind: 'leaderboard', group: 'Leaderboard' },
];
