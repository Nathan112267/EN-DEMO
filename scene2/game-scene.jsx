/* Scene 2 game scene + HUD */

import React from "react";

const GameScene = () => {
  return (
    <div className="game">
      {/* clouds */}
      <div className="cloud c1" style={{ left: '5%', top: '8%', width: 380, height: 80 }} />
      <div className="cloud c2" style={{ left: '55%', top: '5%', width: 460, height: 90 }} />
      <div className="cloud c3" style={{ left: '32%', top: '14%', width: 280, height: 60 }} />

      {/* distant mountains */}
      <div className="mtn" style={{ top: '24%', height: 220, opacity: 0.55 }}>
        <svg viewBox="0 0 1600 220" preserveAspectRatio="none">
          <path d="M0,220 L0,140 L120,80 L260,150 L380,60 L520,140 L680,40 L860,130 L1020,70 L1180,150 L1320,60 L1460,140 L1600,90 L1600,220 Z"
            fill="oklch(0.55 0.06 220)" />
        </svg>
      </div>
      <div className="mtn" style={{ top: '30%', height: 240, opacity: 0.75 }}>
        <svg viewBox="0 0 1600 240" preserveAspectRatio="none">
          <path d="M0,240 L0,180 L160,120 L320,170 L480,90 L660,160 L820,100 L980,180 L1180,110 L1360,170 L1520,130 L1600,150 L1600,240 Z"
            fill="oklch(0.40 0.08 200)" />
        </svg>
      </div>
      <div className="mtn" style={{ top: '36%', height: 260, opacity: 1 }}>
        <svg viewBox="0 0 1600 260" preserveAspectRatio="none">
          <path d="M0,260 L0,220 L140,140 L280,200 L460,120 L620,200 L800,150 L1000,210 L1200,160 L1400,200 L1600,170 L1600,260 Z"
            fill="oklch(0.32 0.10 160)" />
        </svg>
      </div>

      {/* grass field */}
      <div className="field" />

      {/* a couple of trees */}
      <div className="tree" style={{ left: 80, bottom: 720 }}>
        <svg width="180" height="280" viewBox="0 0 180 280">
          <ellipse cx="90" cy="100" rx="80" ry="95" fill="oklch(0.22 0.12 145)" />
          <ellipse cx="65" cy="80" rx="50" ry="65" fill="oklch(0.28 0.13 145)" />
          <ellipse cx="115" cy="90" rx="55" ry="70" fill="oklch(0.25 0.12 145)" />
          <rect x="80" y="170" width="20" height="100" fill="oklch(0.18 0.06 50)" />
        </svg>
      </div>
      <div className="tree" style={{ right: 120, bottom: 760, transform: 'scale(0.85)' }}>
        <svg width="180" height="280" viewBox="0 0 180 280">
          <ellipse cx="90" cy="100" rx="78" ry="92" fill="oklch(0.20 0.11 145)" />
          <ellipse cx="115" cy="80" rx="48" ry="62" fill="oklch(0.26 0.13 145)" />
          <rect x="82" y="170" width="18" height="100" fill="oklch(0.16 0.06 50)" />
        </svg>
      </div>

      {/* dust ring */}
      <div className="dust" />

      {/* atmospheric pollen / dust motes */}
      <div className="particle p1" />
      <div className="particle p2" />
      <div className="particle p3" />
      <div className="particle p4" />
      <div className="particle p5" />
      <div className="particle p6" />
      <div className="particle p7" />
      <div className="particle p8" />

      {/* player (back view) */}
      <div className="player">
        <svg viewBox="0 0 280 460" width="280" height="460">
          {/* cape */}
          <path d="M70,180 Q140,180 210,180 L240,400 Q140,420 40,400 Z" fill="oklch(0.32 0.18 30)" />
          <path d="M70,180 Q140,180 210,180 L235,395 Q140,415 45,395 Z" fill="oklch(0.40 0.22 30)" opacity="0.6" />
          {/* shoulders/back */}
          <ellipse cx="140" cy="190" rx="90" ry="40" fill="oklch(0.18 0.04 250)" />
          {/* torso armor back */}
          <path d="M70,200 L210,200 L200,330 L80,330 Z" fill="oklch(0.22 0.05 250)" />
          <path d="M85,205 L195,205 L188,325 L92,325 Z" fill="oklch(0.32 0.06 250)" opacity="0.6" />
          {/* belt */}
          <rect x="78" y="320" width="124" height="14" fill="oklch(0.15 0.06 50)" />
          <rect x="130" y="318" width="20" height="20" fill="oklch(0.78 0.16 75)" />
          {/* head (back) */}
          <ellipse cx="140" cy="120" rx="56" ry="62" fill="oklch(0.22 0.04 60)" />
          <ellipse cx="140" cy="100" rx="58" ry="38" fill="oklch(0.18 0.05 50)" />
          {/* hair */}
          <path d="M88,125 Q88,80 140,72 Q192,80 192,125 L188,150 L92,150 Z" fill="oklch(0.18 0.05 50)" />
          {/* legs */}
          <rect x="100" y="330" width="32" height="100" rx="6" fill="oklch(0.18 0.04 250)" />
          <rect x="148" y="330" width="32" height="100" rx="6" fill="oklch(0.18 0.04 250)" />
          {/* sword on back */}
          <rect x="195" y="60" width="14" height="180" rx="3" fill="oklch(0.55 0.04 250)" transform="rotate(20 202 150)" />
          <rect x="190" y="200" width="24" height="18" rx="3" fill="oklch(0.45 0.10 60)" transform="rotate(20 202 209)" />
        </svg>
      </div>

      {/* HUD */}
      <div className="hud">
        {/* top-left: minimap, compass, quest */}
        <div className="hud-tl">
          <div className="minimap">
            <div className="minimap-N">N</div>
            <div className="quest-marker" />
            <div className="quest-marker b" />
            <div className="player-dot" />
          </div>
          <div className="compass">N · 287°</div>
          <div className="quest">
            <div className="quest-tag">主线 · 第三章</div>
            <div className="quest-title">寻找远古遗迹</div>
            <div className="quest-step done">
              <span className="box"><svg viewBox="0 0 16 16"><path d="M3 8 L7 12 L13 4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              抵达旷野之地
            </div>
            <div className="quest-step">
              <span className="box"><svg viewBox="0 0 16 16"><path d="M3 8 L7 12 L13 4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              击败遗迹守卫
            </div>
            <div className="quest-step">
              <span className="box"><svg viewBox="0 0 16 16"><path d="M3 8 L7 12 L13 4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              获取虚空碎片 · 0/3
            </div>
          </div>
        </div>

        {/* top-right: player + bars */}
        <div className="hud-tr">
          <div className="player-card">
            <div className="player-info" style={{ alignItems: 'flex-end' }}>
              <div className="player-name">凛风行者</div>
              <div className="player-lvl">Lv.42 · 圣骑士</div>
            </div>
            <div className="player-avatar">凛</div>
          </div>
          <div className="bars">
            <div className="bar hp">
              <div className="bar-label">HP</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '78%' }} />
                <div className="bar-num">2,847 / 3,650</div>
              </div>
            </div>
            <div className="bar mp">
              <div className="bar-label">MP</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '62%' }} />
                <div className="bar-num">744 / 1,200</div>
              </div>
            </div>
            <div className="bar xp">
              <div className="bar-label">EXP</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '34%' }} />
                <div className="bar-num">12,840 / 38,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* virtual joystick */}
        <div className="joystick" />

        {/* chat */}
        <div className="chat">
          <div className="chat-line"><span className="sys">[系统]</span> 你已进入「碎光旷野」</div>
          <div className="chat-line"><span className="name">[凛风行者]</span> 终于到了</div>
          <div className="chat-line"><span className="name b">[落星辰]</span> 这里的怪不好打 小心点</div>
          <div className="chat-line"><span className="name c">[白夜歌]</span> 副本组队还差一人</div>
        </div>

        {/* skills */}
        <div className="skills">
          <div className="skill cd">
            <svg viewBox="0 0 50 50"><path d="M25 8 L32 22 L46 22 L34 31 L38 45 L25 36 L12 45 L16 31 L4 22 L18 22 Z" fill="oklch(0.78 0.18 240)" stroke="#fff" strokeWidth="1"/></svg>
            <div className="cd-num">3</div>
            <div className="key">Q</div>
          </div>
          <div className="skill">
            <svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="14" fill="oklch(0.78 0.18 145)"/><path d="M25 13 L25 37 M13 25 L37 25" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
            <div className="key">E</div>
          </div>
          <div className="skill">
            <svg viewBox="0 0 50 50"><path d="M10 25 L25 10 L40 25 L25 40 Z" fill="oklch(0.85 0.16 75)"/></svg>
            <div className="key">R</div>
          </div>
          <div className="skill-attack">
            <svg viewBox="0 0 80 80"><path d="M40 8 L48 28 L70 28 L52 42 L60 64 L40 50 L20 64 L28 42 L10 28 L32 28 Z" fill="#fff" stroke="oklch(0.20 0.05 30)" strokeWidth="2"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

window.GameScene = GameScene;
export default GameScene;
