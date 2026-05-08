/* Scene 3 orchestration */

import React from "react";
import XhsFeed from "./xhs-feed.jsx";
import LightFrame from "./light-frame.jsx";
import DrawLayer from "./draw-layer.jsx";
import AICard from "./ai-card.jsx";

const App = () => {
  // phases:
  // 0: feed only (0 - 4s)
  // 1: light frame appears, image becomes tappable
  // 2: AI card open
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    if (phase === 0) {
      const t = setTimeout(() => setPhase(1), 4000);
      return () => clearTimeout(t);
    }
    // phase 1 advances when user completes drawing a circle
  }, [phase]);

  const onProductClick = () => {
    if (phase >= 1) setPhase(2);
  };
  const onClose = () => {
    if (phase === 2) setPhase(1);
  };
  const onReplay = () => setPhase(0);

  return (
    <div className="app-root">
      <XhsFeed onProductClick={onProductClick} highlight={phase === 1} />
      <LightFrame visible={phase >= 1} />
      <DrawLayer active={phase === 1} onComplete={() => setPhase(2)} />
      <AICard visible={phase === 2} onClose={onClose} />

      {phase >= 1 && (
        <button className="replay-btn in" onClick={onReplay}>
          <svg viewBox="0 0 22 22" fill="none">
            <path d="M4 11 A7 7 0 1 1 11 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <path d="M4 5 L4 11 L10 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          重播演示
        </button>
      )}
    </div>
  );
};

export default App;
