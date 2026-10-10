import React from 'react';
import { NextSteps, Section } from './docs-content';
import { tasks, taskPath, VideoGallery } from './tasks';

const diagnosticGroups = [
  {
    id: 'diagnostic-failure-recovery', title: 'Failure and Recovery Trajectories',
    description: 'After an initial execution error, compare error continuation, effective recovery, and ineffective recovery.',
    labels: ['Error Continuation', 'Effective Recovery', 'Ineffective Recovery'],
    examples: [
      { taskId: 'simulation/insert-tubes', sources: ['/assets/diagnostics/insert-tubes/a.mp4', '/assets/diagnostics/insert-tubes/b.mp4', '/assets/diagnostics/insert-tubes/c.mp4'] },
      { taskId: 'simulation/store-laptop-and-headphones', sources: ['/assets/diagnostics/store-laptop-and-headphones/a.mp4', '/assets/diagnostics/store-laptop-and-headphones/b.mp4', '/assets/diagnostics/store-laptop-and-headphones/c.mp4'] },
      { taskId: 'real-world/organize-books-and-pen', sources: ['/assets/diagnostics/organize-books-and-pen/a.mp4', '/assets/diagnostics/organize-books-and-pen/b.mp4', '/assets/diagnostics/organize-books-and-pen/c.mp4'] },
      { taskId: 'real-world/place-pot-on-induction-cooker', sources: ['/assets/diagnostics/place-pot-on-induction-cooker/a.mp4', '/assets/diagnostics/place-pot-on-induction-cooker/b.mp4', '/assets/diagnostics/place-pot-on-induction-cooker/c.mp4'] },
    ],
  },
  {
    id: 'diagnostic-long-horizon', title: 'Long-Horizon Temporal Trajectories',
    description: 'Repeated actions revisit visually similar states while execution history changes the accumulated task progress.',
    labels: ['History-dependent execution'],
    examples: [
      { taskId: 'simulation/press-by-number', sources: ['/assets/tasks/videos/press-by-number/id.mp4'] },
      { taskId: 'simulation/swap-blocks', sources: ['/assets/tasks/videos/swap-blocks/id.mp4'] },
      { taskId: 'real-world/operate-drawers-in-sequence', sources: ['/assets/diagnostics/operate-drawers-in-sequence/history.mp4'] },
      { taskId: 'real-world/strike-drum-five-times', sources: ['/assets/diagnostics/strike-drum-five-times/history.mp4'] },
    ],
  },
  {
    id: 'diagnostic-multi-solution', title: 'Multi-Solution Trajectories',
    description: 'Alternative valid subtask orders or allocations of work complete the same task while respecting its dependencies.',
    labels: ['Solution 1', 'Solution 2', 'Solution 3'],
    examples: [
      { taskId: 'simulation/pack-objects-into-box', sources: ['/assets/diagnostics/pack-objects-into-box/solution-1.mp4', '/assets/diagnostics/pack-objects-into-box/solution-2.mp4', '/assets/diagnostics/pack-objects-into-box/solution-3.mp4'] },
      { taskId: 'simulation/stack-blocks', sources: ['/assets/diagnostics/stack-blocks/solution-1.mp4', '/assets/diagnostics/stack-blocks/solution-2.mp4', '/assets/diagnostics/stack-blocks/solution-3.mp4'] },
      { taskId: 'real-world/arrange-seasoning-jars', sources: ['/assets/diagnostics/arrange-seasoning-jars/solution-1.mp4', '/assets/diagnostics/arrange-seasoning-jars/solution-2.mp4', '/assets/diagnostics/arrange-seasoning-jars/solution-3.mp4'] },
      { taskId: 'real-world/set-the-table', sources: ['/assets/diagnostics/set-the-table/solution-1.mp4', '/assets/diagnostics/set-the-table/solution-2.mp4', '/assets/diagnostics/set-the-table/solution-3.mp4'] },
    ],
  },
];

export const diagnosticSections = diagnosticGroups.map(group => [group.id, group.title]);

export function DiagnosticTrajectories() {
  return <div className="doc-content">
    <p className="doc-lead">Selected standard-version previews illustrate the benchmark’s diagnostic trajectory design. Examples from simulation and the real world are grouped by execution pattern, not by domain.</p>
    {diagnosticGroups.map(group => <Section key={group.id} id={group.id} title={group.title}>
      <p>{group.description}</p>
      {group.examples.map(example => {
        const task = tasks.find(candidate => candidate.id === example.taskId);
        const videos = example.sources.map((src, index) => ({ src, label: group.labels[index] }));
        return <div className="diagnostic-example" key={example.taskId}>
          <h3><a href={taskPath(task)}>{task.title}</a><span className="diagnostic-domain">{task.domain === 'simulation' ? 'Simulation' : 'Real-World'}</span></h3>
          <VideoGallery videos={videos} title={task.title} />
        </div>;
      })}
    </Section>)}
    <NextSteps links={[["/doc/get-started/protocol/metrics/", 'Metrics Reference'], ["/doc/get-started/data/", 'Dataset Overview&Download']]} />
  </div>;
}
