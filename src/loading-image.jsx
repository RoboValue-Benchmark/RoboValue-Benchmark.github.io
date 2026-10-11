import React, { useEffect, useRef, useState } from 'react';

export function LoadingImage({ src, className = '', onLoad, onError, ...props }) {
  const image = useRef(null);
  const [loadedSource, setLoadedSource] = useState(null);
  const loaded = loadedSource === src;

  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0) {
      setLoadedSource(src);
    }
  }, [src]);

  return <>
    <img {...props} ref={image} src={src} className={`rv-loading-image${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`} onLoad={event => { setLoadedSource(src); onLoad?.(event); }} onError={onError} />
    {!loaded && <svg className="rv-image-placeholder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8" cy="9" r="1.25" />
      <path d="m4 17 5-5 3 3 3-4 5 6" />
    </svg>}
  </>;
}
