import React from 'react';
import { Icon } from './benchmark';
import './community.css';

export const DISCORD_INVITE = 'https://discord.gg/fveHQxF3P';

export function CommunityPage() {
  return <main className="community-page" id="main-content" tabIndex={-1}>
    <header className="community-heading">
      <h1>Community</h1>
      <p>Connect on WeChat and Discord to discuss the benchmark, evaluation, and robotic value models.</p>
    </header>

    <section className="community-channel community-wechat" id="wechat" aria-labelledby="community-wechat-title">
      <div className="community-channel-copy">
        <h2 id="community-wechat-title">WeChat</h2>
        <p>Scan the QR code with WeChat to join the RoboValue discussion group.</p>
      </div>
      <figure className="community-qr-card">
        <a href="/assets/community-wechat.png" target="_blank" rel="noopener noreferrer" aria-label="Open the RoboValue WeChat QR code at full size">
          <img src="/assets/community-wechat.png" alt="QR code for the RoboValue WeChat discussion group" width="540" height="830" />
        </a>
        <figcaption>RoboValue WeChat Group</figcaption>
      </figure>
    </section>

    <section className="community-channel community-discord" id="discord" aria-labelledby="community-discord-title">
      <div className="community-channel-copy">
        <h2 id="community-discord-title">Discord</h2>
        <p>Join the RoboValue server to connect with the community.</p>
      </div>
      <a className="community-join-link" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join Discord<Icon size={20} /></a>
    </section>
  </main>;
}
