import React, { useEffect, useRef, useState } from 'react';
import taskData from './data/tasks.json';

// Alternate simulation clip frames with the existing real-world task images.
const SIMULATION_SCENES = [
  'make-toast-env', 'fill-pen-holder', 'fold-clothes', 'stack-blocks', 'organize-table', 'hang-mugs-emb',
  'hang-mugs', 'swap-blocks', 'store-laptop-and-headphone-frt', 'pack-objects-into-box', 'press-by-number', 'arrange-largest-number',
  'put-bottles-into-dustbin', 'sweep-blocks', 'make-toast', 'insert-tubes', 'store-laptop-and-headphone', 'play-stacking-toy',
].map(scene => `/assets/hero-scenes/${scene}.webp`);
const REAL_WORLD_SCENES = taskData.tasks
  .filter(task => task.domain === 'real-world')
  .map(task => task.images.id);
const ROW_DURATION = 210;

export function HeroBackground() {
  const wall = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [rowCount, setRowCount] = useState(8);
  const [columnCount, setColumnCount] = useState(12);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(wall.current);
    const resizeObserver = new ResizeObserver(() => {
      const tile = wall.current.querySelector('.rv-hero-scene');
      const gap = parseFloat(getComputedStyle(wall.current.querySelector('.rv-hero-wall')).gap);
      const rowHeight = tile.getBoundingClientRect().height + gap;
      setRowCount(Math.max(8, Math.ceil(wall.current.clientHeight / rowHeight) + 1));
      const tileWidth = tile.getBoundingClientRect().width + gap;
      setColumnCount(Math.max(12, Math.ceil(wall.current.clientWidth / tileWidth) + 1));
    });
    resizeObserver.observe(wall.current);
    const updateVisibility = () => setTabVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return <>
    <div ref={wall} className={`rv-hero-backdrop${paused || !visible || !tabVisible ? ' is-paused' : ''}`} aria-hidden="true">
      <div className="rv-hero-wall">
        {Array.from({ length: rowCount }, (_, row) => {
          const realWorld = row % 2 !== 0;
          const pool = realWorld ? REAL_WORLD_SCENES : SIMULATION_SCENES;
          const offset = Math.floor(row / 2) * 5;
          const scenes = Array.from({ length: columnCount }, (_, index) => pool[(index + offset) % pool.length]);
          return <div className={`rv-hero-row${realWorld ? ' rv-hero-row-real' : ''}`} key={row} style={{ '--row-duration': `${ROW_DURATION}s` }}>
            {[0, 1].map(copy => <div className="rv-hero-row-group" key={copy}>
              {scenes.map((scene, index) => <div className="rv-hero-scene" key={`${scene}-${index}`}>
                <img src={scene} alt="" width="320" height="240" decoding="async" fetchPriority={row === 0 && index < 3 && copy === 0 ? 'high' : 'low'} />
              </div>)}
            </div>)}
          </div>;
        })}
      </div>
      <div className="rv-hero-wash" />
      <div className="rv-hero-reading" />
    </div>
    <button className="rv-backdrop-toggle" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Resume background motion' : 'Pause background motion'} title={paused ? 'Resume background motion' : 'Pause background motion'}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paused ? <path d="m9 5 11 7-11 7V5Z" /> : <><path d="M8 5v14M16 5v14" /></>}
      </svg>
    </button>
  </>;
}
