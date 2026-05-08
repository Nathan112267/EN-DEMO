/* AI notification banner from top */

import React from "react";
import NomiBall from "./nomi-ball.jsx";

const AINotification = ({ state, onClick }) => {
  // state: 'hidden' | 'in' | 'out'
  const cls = state === 'in' ? 'in' : state === 'out' ? 'out' : '';
  if (state === 'hidden') return null;

  return (
    <div className={`ai-notif ${cls}`} onClick={onClick}>
      <div className="ai-notif-ico">
        <NomiBall size="small" />
      </div>
      <div className="ai-notif-body">
        <div className="ai-notif-meta">
          <span className="badge"><span className="dot" />AI 助手</span>
          <span>处理通知</span>
          <span className="time">现在</span>
        </div>
        <div className="ai-notif-headline">
          <span className="ai-notif-title">为你准备了一份游戏攻略 · 可以帮你快速通关</span>
          <span className="ai-notif-tag">《七天速通主线》</span>
        </div>
      </div>
      <div className="ai-notif-arrow">
        <svg viewBox="0 0 28 28" fill="none">
          <path d="M10 6 L18 14 L10 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

window.AINotification = AINotification;
export default AINotification;
