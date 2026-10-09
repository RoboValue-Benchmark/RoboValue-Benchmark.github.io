import React from 'react';
import { GROUPS } from './benchmark-metrics';
import './benchmark-overview.css';

export function BenchmarkOverview() {
  return <figure className="benchmark-overview" aria-label="RoboValue evaluation workflow">
    <div className="bo-step">
      <span className="bo-number">01</span><h3>Sim-and-real trajectories</h3>
      <div className="bo-domains"><span><strong>15</strong> Simulation tasks</span><span><strong>20</strong> Real-world tasks</span></div>
      <p>Standard conditions, embodiment shifts, and environment shifts.</p>
    </div>
    <span className="bo-arrow" aria-hidden="true">→</span>
    <div className="bo-step">
      <span className="bo-number">02</span><h3>Shared model interfaces</h3>
      <div className="bo-interfaces"><span>Scalar value</span><span>Pairwise comparison</span><span>Subtask description</span></div>
      <p>Model-specific adapters preserve native value semantics.</p>
    </div>
    <span className="bo-arrow" aria-hidden="true">→</span>
    <div className="bo-step">
      <span className="bo-number">03</span><h3>Four capability profiles</h3>
      <ul className="bo-profiles">{GROUPS.map(group => <li key={group.id} style={{ '--capability-color': `var(--rv-capability-${group.id}, ${group.color})` }}><i aria-hidden="true" />{group.title}</li>)}</ul>
    </div>
    <figcaption>A shared evaluation protocol connects heterogeneous value models to complementary diagnostic tests.</figcaption>
  </figure>;
}
