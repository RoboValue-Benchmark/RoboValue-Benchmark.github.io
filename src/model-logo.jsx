import React from 'react';
import modelLogos from './data/model-logos.json';
import './model-logo.css';

export function ModelLogo({ name }) {
  const family = Object.keys(modelLogos).find(key => name === key || name.startsWith(`${key}-`));
  if (!family) return null;
  const logo = modelLogos[family];
  return <img className="model-logo" src={logo.src} alt="" width="28" height="28" decoding="async" loading="lazy" title={logo.label} data-model-family={family} data-logo-kind={logo.kind} />;
}
