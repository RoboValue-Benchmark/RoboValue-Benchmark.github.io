import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './benchmark';
import './figure-viewer.css';

const ZOOM_LEVELS = [1, 1.5, 2, 3, 4, 6];

export function ZoomableFigure({ src, alt, caption, title, className = '' }) {
  const dialog = useRef(null);
  const viewport = useRef(null);
  const drag = useRef(null);
  const titleId = useId();
  const captionId = useId();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState(1);
  const [fitWidth, setFitWidth] = useState(0);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${padding + scrollbar}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const area = viewport.current;
    const measure = () => setFitWidth(Math.max(1, Math.min(area.clientWidth - 32, (area.clientHeight - 32) * ratio)));
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    measure();
    return () => observer.disconnect();
  }, [open, ratio]);

  function show() {
    setZoom(window.matchMedia('(max-width: 760px)').matches ? 2 : 1);
    dialog.current.showModal();
    setOpen(true);
    viewport.current.scrollTo(0, 0);
  }

  function changeZoom(next) {
    const area = viewport.current;
    const x = (area.scrollLeft + area.clientWidth / 2) / area.scrollWidth;
    const y = (area.scrollTop + area.clientHeight / 2) / area.scrollHeight;
    setZoom(next);
    requestAnimationFrame(() => {
      area.scrollLeft = x * area.scrollWidth - area.clientWidth / 2;
      area.scrollTop = y * area.scrollHeight - area.clientHeight / 2;
    });
  }

  function stepZoom(direction) {
    const index = ZOOM_LEVELS.indexOf(zoom);
    changeZoom(ZOOM_LEVELS[Math.max(0, Math.min(ZOOM_LEVELS.length - 1, index + direction))]);
  }

  function onKeyDown(event) {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      stepZoom(1);
    } else if (event.key === '-') {
      event.preventDefault();
      stepZoom(-1);
    } else if (event.key === '0') {
      event.preventDefault();
      changeZoom(1);
    }
  }

  function startDrag(event) {
    if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event) {
    if (!drag.current) return;
    event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
    event.currentTarget.scrollTop = drag.current.top - (event.clientY - drag.current.y);
  }

  return <figure className={`paper-figure ${className}`}>
    <button className="figure-open" onClick={show} aria-label={`Enlarge: ${alt}`}>
      <img src={src} alt={alt} loading="lazy" onLoad={event => setRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />
      <span className="expand"><Icon name="expand" /> Enlarge figure</span>
    </button>
    {caption && <figcaption>{caption}</figcaption>}
    <dialog ref={dialog} className="figure-dialog figure-dialog--zoomable" aria-labelledby={titleId} aria-describedby={caption ? captionId : undefined} onClose={() => { setOpen(false); drag.current = null; }} onKeyDown={onKeyDown} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="figure-viewer-toolbar">
        <span className="figure-viewer-title" id={titleId}>{title}</span>
        <div className="figure-viewer-controls" role="group" aria-label="Figure zoom controls">
          <button type="button" onClick={() => stepZoom(-1)} disabled={zoom === ZOOM_LEVELS[0]} aria-label="Zoom out" title="Zoom out (−)">−</button>
          <output aria-live="polite" aria-label="Zoom relative to fit">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => stepZoom(1)} disabled={zoom === ZOOM_LEVELS.at(-1)} aria-label="Zoom in" title="Zoom in (+)">+</button>
          <button type="button" className="figure-viewer-fit" onClick={() => changeZoom(1)} title="Fit to window (0)">Fit</button>
          <button type="button" onClick={() => dialog.current.close()} aria-label="Close figure" title="Close (Esc)"><Icon name="close" /></button>
        </div>
      </div>
      <div ref={viewport} className={`figure-viewer-viewport${zoom > 1 ? ' is-zoomed' : ''}`} role="region" aria-label="Figure details, scroll or drag to explore when zoomed" tabIndex={0} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
        <div className="figure-viewer-canvas" style={{ '--figure-image-width': `${fitWidth * zoom}px`, '--figure-image-height': `${fitWidth * zoom / ratio}px` }}>
          <img src={src} alt={alt} draggable="false" onLoad={event => setRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />
        </div>
      </div>
      {caption && <p className="figure-viewer-caption" id={captionId}>{caption}</p>}
    </dialog>
  </figure>;
}
