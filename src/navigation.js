import taskData from './data/tasks.json';
import { GROUPS, METRICS } from './benchmark-metrics.js';

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

export const navigation = [
  { title: 'Home', pages: [{ path: '/doc/', title: 'RoboValue', kind: 'home' }] },
  { title: 'Get Started', pages: [
    { path: '/doc/get-started/', title: 'Quick Start', kind: 'start' },
    { path: '/doc/get-started/data/', title: 'Dataset Overview&Download', kind: 'data' },
    { path: '/doc/get-started/evaluation/', title: 'Evaluation Workflow', kind: 'evaluation', children: [
      { path: '/doc/get-started/adapters/', title: 'Submit a Model', kind: 'submission' },
      { path: '/doc/model-api/', title: 'Service & Adapter', kind: 'integration' },
      { path: '/doc/get-started/evaluation/results/', title: 'Evaluation & Results', kind: 'evaluation-results' },
    ] },
    { path: '/doc/get-started/protocol/', title: 'Protocol & Metrics', kind: 'protocol', children: [
      { path: '/doc/get-started/protocol/evaluation/', title: 'Evaluation Protocol', kind: 'evaluation-protocol', anchors: ['protocol-settings', 'protocol-coverage', 'protocol-results', 'protocol-provenance'] },
      { path: '/doc/get-started/protocol/metrics/', title: 'Metrics Reference', kind: 'metrics', anchors: GROUPS.map(group => `protocol-${group.id}`), children: metricPages },
    ] },
  ] },
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
    { path: '/doc/diagnostic-trajectories/failure-and-recovery/', title: 'Failure and Recovery', kind: 'diagnostic-category', category: 'diagnostic-failure-recovery', anchors: ['diagnostic-failure-recovery'] },
    { path: '/doc/diagnostic-trajectories/long-horizon/', title: 'Long-Horizon Temporal', kind: 'diagnostic-category', category: 'diagnostic-long-horizon', anchors: ['diagnostic-long-horizon'] },
    { path: '/doc/diagnostic-trajectories/multi-solution/', title: 'Multi-Solution', kind: 'diagnostic-category', category: 'diagnostic-multi-solution', anchors: ['diagnostic-multi-solution'] },
  ] }] },
];
function flattenPages(page, group, parent) {
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
  { path: '/community/', title: 'Community', kind: 'community', group: 'Community' },
  { path: '/leaderboard/', title: 'Leaderboard', kind: 'leaderboard', group: 'Leaderboard' },
];
