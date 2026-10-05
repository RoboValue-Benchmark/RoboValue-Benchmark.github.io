import taskData from './data/tasks.json';

const taskPages = domain => taskData.tasks.filter(task => task.domain === domain).map(task => ({
  path: `/doc/${domain}-tasks/${task.slug}/`, title: task.title, kind: 'task', taskId: task.id,
}));

// Every entry is a real page. Missing documentation intentionally has no body yet.
export const navigation = [
  { title: 'Home', pages: [{ path: '/doc/', title: 'RoboValue', kind: 'home' }] },
  { title: 'Get Started', pages: [
    { path: '/doc/get-started/', title: 'Overview', kind: 'start' },
    { path: '/doc/get-started/installation/', title: 'Installation' },
    { path: '/doc/get-started/data/', title: 'Dataset Download & Preparation' },
    { path: '/doc/get-started/evaluation/', title: 'Run Evaluation' },
    { path: '/doc/get-started/adapters/', title: 'Add a Model' },
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
  { title: 'Leaderboard', pages: [{ path: '/leaderboard/', title: 'Leaderboard', kind: 'leaderboard' }] },
];
export const pages = [{ path: '/', title: 'RoboValue', kind: 'landing', group: 'Home' }, ...navigation.flatMap(group => group.pages.map(page => ({ ...page, group: group.title })))];
