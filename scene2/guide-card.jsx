/* Guide card modal — Nomi-style AI ball */

import React from "react";
import NomiBall from "./nomi-ball.jsx";

const GuideCard = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <React.Fragment>
      <div className={`modal-backdrop ${visible ? 'in' : ''}`} onClick={onClose} />
      <div className={`guide-card ${visible ? 'in' : ''}`}>
        <button className="gc-close" onClick={onClose} aria-label="关闭">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M9 9 L23 23 M23 9 L9 23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="gc-hero">
          <div className="gc-left">
            <NomiBall size="large" />
          </div>
          <div className="gc-right">
            <div className="gc-meta-line">
              <span className="ai-chip">
                <svg viewBox="0 0 22 22" fill="none">
                  <path d="M11 2 L13 9 L20 11 L13 13 L11 20 L9 13 L2 11 L9 9 Z" fill="currentColor"/>
                </svg>
                AI 助手
              </span>
              <span className="stamp">实时分析中</span>
            </div>
            <div className="gc-title-big">为你准备了一份<br/>游戏攻略</div>
            <div className="gc-sub-big">可以帮你快速通关</div>
            <div className="gc-tag">《七天速通主线》· 第三章 碎光旷野</div>
            <div className="gc-actions">
              <button className="btn" onClick={onClose}>稍后再看</button>
              <button className="btn primary">
                <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
                  <path d="M5 11 L17 11 M12 6 L17 11 L12 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                查看完整攻略
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

window.GuideCard = GuideCard;
export default GuideCard;
