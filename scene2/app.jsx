/* Scene 2 orchestration */

import React from "react";
import BreathBar from "./breath-bar.jsx";
import GameScene from "./game-scene.jsx";
import AINotification from "./ai-notification.jsx";

const App = () => {
  // phases:
  // 0: game only (0-4s)
  // 1: breath bar appears (4s-7s)
  // 2: AI notification slides in (7s+)
  const [phase, setPhase] = React.useState(0);

  // 0 -> 1 after 4s (breath bar)
  React.useEffect(() => {
    if (phase !== 0) return;
    const t = setTimeout(() => setPhase(1), 4000);
    return () => clearTimeout(t);
  }, [phase]);

  // 1 -> 2 after 3s more (notification)
  React.useEffect(() => {
    if (phase !== 1) return;
    const t = setTimeout(() => setPhase(2), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  const onReplay = () => {
    setPhase(0);
  };

  const notifState = phase >= 2 ? 'in' : 'hidden';

  return (
    <div className="app-root">
      <div className="landscape-wrap">
        <GameScene />
        <BreathBar visible={phase >= 1} />
        <AINotification state={notifState} />
      </div>

      {phase >= 2 && (
        <button
          className="replay-btn in"
          onClick={onReplay}
        >
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
