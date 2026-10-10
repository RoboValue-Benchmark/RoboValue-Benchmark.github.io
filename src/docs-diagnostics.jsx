import React from 'react';
import { NextSteps, Section } from './docs-content';
import { tasks, taskPath, VideoGallery } from './tasks';
import { METRICS } from './benchmark-metrics';

const diagnosticGroups = [
  {
    id: 'diagnostic-failure-recovery', title: 'Failure and Recovery Trajectories',
    description: 'Start from an execution error, then contrast leaving it unresolved, correcting it, and trying to correct it without success.',
    slug: 'failure-and-recovery', question: 'A recovery attempt is not a recovery outcome.',
    pattern: 'An execution error creates three distinct paths: the robot continues without fixing it, makes a successful correction, or tries to recover but leaves the error unresolved. The difference lies in both the response and its outcome—not simply whether the robot moves again.',
    capability: 'FPL asks whether the largest value decline locates the onset of failure. TRR asks whether value falls with the error, responds to a recovery attempt, and then distinguishes a successful correction from an unsuccessful one. A retry and a resolved error are different events; the feedback should not conflate them.',
    evidence: 'Read the execution through to the outcome. Reaching again for an object can be a corrective attempt; moving on without resolving the error is not successful recovery. The selected videos illustrate the three patterns, rather than constituting a single matched scoring group.',
    metrics: ['fpl', 'trr'],
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
    description: 'A fifth button press can look like the first. The completed work differs even when the image barely changes.',
    slug: 'long-horizon', question: 'The same-looking state can mean different progress.',
    pattern: 'Pressing a button, striking a drum, or operating drawers can bring the robot back to a familiar-looking state. That state may follow one completed action or several. These successful trajectories revisit similar observations while the amount of completed work changes.',
    capability: 'Memory-VOC asks whether values track accumulated progress through these repeated states. For an instruction such as “strike the drum five times,” progress depends on how many strikes have occurred, not just the drum and arm position in the current image.',
    evidence: 'A value curve that rises with elapsed time can correlate with progress without using the relevant history. Read Memory-VOC alongside VOC and the controlled forward–reverse test in Cycle-VOC; a high correlation alone does not establish memory use.',
    metrics: ['memory_voc', 'voc', 'cycle_voc'],
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
    description: 'Complete the same task in different valid orders, sometimes changing which arm does the work.',
    slug: 'multi-solution', question: 'Change the order, not the goal.',
    pattern: 'Packing objects, arranging jars, and setting a table can allow more than one valid order of work. These trajectories vary that order and, in selected tasks, the operating arm or division of work between arms. Every solution still satisfies the same instruction and its dependencies.',
    capability: 'CSVC compares the value gain assigned to the same semantic subtask across valid solutions. It tests whether feedback changes merely because that subtask occurs earlier, later, or within a different valid allocation of work.',
    evidence: 'Compare matched subtasks, not equal timestamps or absolute values across the videos. Similar gains indicate consistency; they do not, on their own, establish correct progress direction. Interpret CSVC together with the benchmark’s progress tests.',
    metrics: ['csvc'],
    labels: ['Solution 1', 'Solution 2', 'Solution 3'],
    examples: [
      { taskId: 'simulation/pack-objects-into-box', sources: ['/assets/diagnostics/pack-objects-into-box/solution-1.mp4', '/assets/diagnostics/pack-objects-into-box/solution-2.mp4', '/assets/diagnostics/pack-objects-into-box/solution-3.mp4'] },
      { taskId: 'simulation/stack-blocks', sources: ['/assets/diagnostics/stack-blocks/solution-1.mp4', '/assets/diagnostics/stack-blocks/solution-2.mp4', '/assets/diagnostics/stack-blocks/solution-3.mp4'] },
      { taskId: 'real-world/arrange-seasoning-jars', sources: ['/assets/diagnostics/arrange-seasoning-jars/solution-1.mp4', '/assets/diagnostics/arrange-seasoning-jars/solution-2.mp4', '/assets/diagnostics/arrange-seasoning-jars/solution-3.mp4'] },
      { taskId: 'real-world/set-the-table', sources: ['/assets/diagnostics/set-the-table/solution-1.mp4', '/assets/diagnostics/set-the-table/solution-2.mp4', '/assets/diagnostics/set-the-table/solution-3.mp4'] },
    ],
  },
];

export const diagnosticSections = [['trajectory-pattern', 'Trajectory pattern'], ['tested-capability', 'What this tests'], ['diagnostic-examples', 'Video examples']];

export function DiagnosticTrajectories() {
  return <div className="doc-content">
    <p className="doc-lead">A successful ending can hide a skipped step, an unresolved error, or a misleading value trend. Diagnostic trajectories isolate these distinctions so that execution feedback can be examined beyond the final outcome.</p>
    <p>The three collections bring simulation and real-world examples together by the execution pattern they test. All previews use the Standard Version setting.</p>
    <div className="diagnostic-collections">{diagnosticGroups.map(group => <a key={group.id} href={`/doc/diagnostic-trajectories/${group.slug}/`}><h2>{group.title}<span aria-hidden="true">→</span></h2><p>{group.question}</p><span>{group.description}</span></a>)}</div>
  </div>;
}

export function DiagnosticCategory({ category }) {
  const group = diagnosticGroups.find(candidate => candidate.id === category);
  return <div className="doc-content" id={group.id}>
    <p className="doc-lead">{group.question}</p>
    <Section id="trajectory-pattern" title="Trajectory pattern"><p>{group.pattern}</p>{group.id === 'diagnostic-failure-recovery' && <dl className="doc-definition-list"><div><dt>Error Continuation</dt><dd>The robot proceeds without correcting the execution error.</dd></div><div><dt>Effective Recovery</dt><dd>Corrective actions resolve the error.</dd></div><div><dt>Ineffective Recovery</dt><dd>The robot attempts a correction but does not resolve the error before continuing.</dd></div></dl>}</Section>
    <Section id="tested-capability" title="What this tests"><p>{group.capability}</p><p>{group.evidence}</p><div className="diagnostic-metrics">{group.metrics.map(key => <a key={key} href={`/doc/get-started/protocol/metrics/${key.replaceAll('_', '-')}/`}>{METRICS[key].label}<span aria-hidden="true">↗</span></a>)}</div></Section>
    <Section id="diagnostic-examples" title="Video examples">
      {group.examples.map(example => {
        const task = tasks.find(candidate => candidate.id === example.taskId);
        const videos = example.sources.map((src, index) => ({ src, label: group.labels[index] }));
        return <div className="diagnostic-example" key={example.taskId}><h3><a href={taskPath(task)}>{task.title}</a><span className="diagnostic-domain">{task.domain === 'simulation' ? 'Simulation' : 'Real-World'}</span></h3><VideoGallery videos={videos} title={task.title} /></div>;
      })}
    </Section>
    <NextSteps links={[["/doc/diagnostic-trajectories/", 'All diagnostic trajectories'], ["/doc/get-started/protocol/metrics/", 'Metrics Reference']]} />
  </div>;
}
