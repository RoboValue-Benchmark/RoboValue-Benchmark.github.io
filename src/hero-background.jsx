import React, { useEffect, useRef, useState } from 'react';
import sceneData from './data/hero-scenes.json';
import { LoadingImage } from './loading-image';

// Paper task images alternate real-world first, then simulation.
// Standard A/B share selected tasks; the eight row types repeat on taller screens.
const ROW_TYPES = sceneData.rows;
// CSS pixels per second; paired real/simulation rows share a speed.
const SPEED_BY_GROUP = {
  'standard-a': 26,
  'cross-embodiment': 15,
  'cross-environment': 36,
  'standard-b': 20,
};

export function HeroBackground() {
  const wall = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [rowCount, setRowCount] = useState(8);
  const [columnCount, setColumnCount] = useState(12);
  const [tilePitch, setTilePitch] = useState(176);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(wall.current);
    const resizeObserver = new ResizeObserver(() => {
      const tile = wall.current.querySelector('.rv-hero-scene');
      if (!tile) return;
      const gap = parseFloat(getComputedStyle(wall.current.querySelector('.rv-hero-wall')).gap);
      const rowHeight = tile.getBoundingClientRect().height + gap;
      setRowCount(Math.max(8, Math.ceil(wall.current.clientHeight / rowHeight) + 1));
      const tileWidth = tile.getBoundingClientRect().width + gap;
      setTilePitch(tileWidth);
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
          const rowType = ROW_TYPES[row % ROW_TYPES.length];
          const realWorld = rowType.domain === 'real-world';
          const crop = sceneData.crop[rowType.domain];
          const cropHeight = crop.sourceHeight - crop.top - crop.bottom;
          const pool = rowType.scenes;
          const offset = Math.floor(row / ROW_TYPES.length) * 7;
          const scenes = Array.from({ length: Math.max(pool.length, columnCount) }, (_, index) => pool[(index + offset) % pool.length]);
          const speed = SPEED_BY_GROUP[rowType.group] ?? 10;
          const duration = scenes.length * tilePitch / speed;
          return <div className={`rv-hero-row${realWorld ? ' rv-hero-row-real' : ''}`} key={row} data-domain={rowType.domain} data-condition={rowType.condition} data-group={rowType.group} style={{ '--row-duration': `${duration}s`, '--scene-aspect-ratio': `${crop.sourceWidth} / ${cropHeight}`, '--scene-image-height': `${crop.sourceHeight / cropHeight * 100}%`, '--scene-crop-top': `${-crop.top / cropHeight * 100}%` }}>
            {[0, 1].map(copy => <div className="rv-hero-row-group" key={copy}>
              {scenes.map((scene, index) => <div className="rv-hero-scene" key={`${scene}-${index}`}>
                <div className="rv-hero-scene-surface">
                  <LoadingImage src={scene} alt="" width={crop.sourceWidth} height={crop.sourceHeight} decoding="async" loading={index < columnCount ? 'eager' : 'lazy'} fetchPriority={row === 0 && index < 3 && copy === 0 ? 'high' : 'low'} />
                </div>
              </div>)}
            </div>)}
          </div>;
        })}
      </div>
      <div className="rv-hero-wash" />
    </div>
    <button className="rv-backdrop-toggle" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Resume background motion' : 'Pause background motion'} title={paused ? 'Resume background motion' : 'Pause background motion'}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paused ? <path d="m9 5 11 7-11 7V5Z" /> : <><path d="M8 5v14M16 5v14" /></>}
      </svg>
    </button>
  </>;
}
