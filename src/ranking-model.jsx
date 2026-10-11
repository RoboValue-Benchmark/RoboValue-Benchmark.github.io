import React from 'react';
import { modelNameParts } from './leaderboard-utils';
import modelLogos from './data/leaderboard-model-logos.json';
import './ranking-model.css';

export function RankingModel({ row }) {
  const family = Object.keys(modelLogos).find(key => row.name === key || row.name.startsWith(`${key}-`));
  const logo = modelLogos[family];
  const { name, qualifier } = modelNameParts(row);
  const label = <>{name}{qualifier && <> <span className="ranking-model-qualifier">{qualifier}</span></>}</>;
  return <span className="ranking-model">
    {logo?.renderAs === 'rynnvalue-brand-mark' ? <span className="ranking-model-logo ranking-rynnvalue-mark" aria-hidden="true" title={logo.label} data-model-family={family} data-logo-kind={logo.kind}><span /></span> : logo && <img className="ranking-model-logo" src={logo.src} width="28" height="28" alt="" title={logo.label} data-model-family={family} data-logo-kind={logo.kind} />}
    {logo?.projectURL ? <a className="ranking-model-label ranking-model-link" href={logo.projectURL} target="_blank" rel="noopener noreferrer" title={`${family} official project · opens in a new tab`}>{label}</a> : <span className="ranking-model-label">{label}</span>}
  </span>;
}

