import React from 'react';
import { TRACKS } from './leaderboard-utils';
import './evaluation-setting.css';

export function SettingBadge({ setting }) {
  return <span className={`lb-setting-badge lb-setting-badge--${setting}`}>{TRACKS[setting]}</span>;
}

export function SettingsSummary() {
  return <p className="lb-settings-summary"><span>Our evaluation settings include</span>{Object.keys(TRACKS).map(setting => <SettingBadge key={setting} setting={setting} />)}</p>;
}
