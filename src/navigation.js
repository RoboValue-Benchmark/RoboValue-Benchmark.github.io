import taskData from './data/tasks.json';

const taskPages = domain => taskData.tasks.filter(task => task.domain === domain).map(task => ({
  path: `/doc/${domain}-tasks/${task.slug}/`, title: task.title, kind: 'task', taskId: task.id,
}));

export const navigation = [
  { title: 'Home', pages: [{ path: '/doc/', title: 'RoboValue', kind: 'home' }] },
  { title: 'Get Started', pages: [
    { path: '/doc/get-started/', title: 'Quick Start', kind: 'start' },
    { path: '/doc/get-started/data/', title: 'Dataset Overview', kind: 'data' },
    { path: '/doc/get-started/evaluation/', title: 'Evaluation Workflow', kind: 'evaluation' },
    { path: '/doc/get-started/adapters/', title: 'Submit a Model', kind: 'submission' },
    { path: '/doc/model-api/', title: 'Service & Adapter', kind: 'integration' },
    { path: '/doc/get-started/protocol/', title: 'Protocol & Metrics', kind: 'protocol' },
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
  { title: 'Community', pages: [{ path: '/community/', title: 'Community', kind: 'community' }] },
];
export const navigationPages = navigation.flatMap(group => group.pages.map(page => ({ ...page, group: group.title })));
export const documentationPages = navigationPages.filter(page => page.path.startsWith('/doc/'));
export const pages = [
  { path: '/', title: 'RoboValue', kind: 'landing', group: 'Home' },
  { path: '/data/', title: 'Data', kind: 'data-release', group: 'Data' },
  ...navigationPages,
  { path: '/leaderboard/', title: 'Leaderboard', kind: 'leaderboard', group: 'Leaderboard' },
];
