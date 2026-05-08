// Scene 4 main app:
//   1. Desktop renders immediately (same as scene1).
//   2. After 4 seconds, AI light frame fades in around the edges.
//   3. Swipe right-to-left to slide the AI companion bar in.
//   4. Tap the voice orb → press animation + simulated dialogue:
//        - user: "帮我买一张去北京的机票"
//        - AI:  "好的，正在帮你查询机票"
//      then bar widens to the left and reveals flight cards.

import React, {
  useCallback as aUseCallback,
  useEffect as aUseEffect,
  useRef as aUseRef,
  useState as aUseState,
} from "react";
import AICompanion from "./ai-companion.jsx";
import Desktop from "./desktop.jsx";
import LightFrame from "./light-frame.jsx";

function App() {
  const [lightOn, setLightOn] = aUseState(false);
  const [barOpen, setBarOpen] = aUseState(false);
  const [barProgress, setBarProgress] = aUseState(0); // 0..1
  // aiState: 'idle' | 'listening' | 'thinking' | 'replied' | 'flights'
  const [aiState, setAiState] = aUseState('idle');
  const [expandedAirline, setExpandedAirline] = aUseState(null);
  const aiTimers = aUseRef([]);
  const dragRef = aUseRef({ active: false, startX: 0, startProgress: 0, moved: false });

  // Trigger AI light frame after 4 seconds
  aUseEffect(() => {
    const id = setTimeout(() => setLightOn(true), 4000);
    return () => clearTimeout(id);
  }, []);

  const animateTo = aUseCallback((from, to, dur = 420) => {
    const start = performance.now();
    const opening = to > from;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = opening
        ? 1 - Math.pow(1 - t, 3)
        : (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const v = from + (to - from) * eased;
      setBarProgress(v);
      if (t < 1) requestAnimationFrame(tick);
      else setBarOpen(to >= 1);
    };
    requestAnimationFrame(tick);
  }, []);

  const onPointerDown = aUseCallback((e) => {
    if (!lightOn) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    dragRef.current = { active: true, startX: x, startProgress: barOpen ? 1 : barProgress, moved: false };
  }, [lightOn, barOpen, barProgress]);

  const onPointerMove = aUseCallback((e) => {
    if (!dragRef.current.active) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const dx = x - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    const vw = window.innerWidth;
    const delta = -dx / (vw * 0.45);
    let p = dragRef.current.startProgress + delta;
    p = Math.max(0, Math.min(1, p));
    setBarProgress(p);
    if (p >= 1) setBarOpen(true);
    if (p <= 0) setBarOpen(false);
  }, []);

  const onPointerUp = aUseCallback(() => {
    if (!dragRef.current.active) return;
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    if (!moved) return;
    setBarProgress(p => {
      const target = p > 0.4 ? 1 : 0;
      const dur = target === 1 ? 420 : 520;
      animateTo(p, target, dur);
      return p;
    });
  }, [animateTo]);

  aUseEffect(() => {
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // ---- AI dialogue choreography ----
  const clearAiTimers = () => {
    aiTimers.current.forEach(t => clearTimeout(t));
    aiTimers.current = [];
  };

  const onOrbPress = aUseCallback(() => {
    if (aiState !== 'idle') return;
    clearAiTimers();
    setAiState('listening');

    // 800ms later, user message lands
    aiTimers.current.push(setTimeout(() => setAiState('thinking'), 1100));
    // 1900ms later, AI reply lands
    aiTimers.current.push(setTimeout(() => setAiState('replied'), 2300));
    // 3200ms later, expand bar + show flights
    aiTimers.current.push(setTimeout(() => setAiState('flights'), 3500));
  }, [aiState]);

  const closeBar = aUseCallback(() => {
    clearAiTimers();
    animateTo(barOpen ? 1 : barProgress, 0, 540);
    // reset AI state shortly after close completes
    setTimeout(() => { setAiState('idle'); setExpandedAirline(null); }, 600);
  }, [animateTo, barOpen, barProgress]);

  const onCardClick = aUseCallback((flight) => {
    // Only the recommended card is interactive — toggle its expansion.
    if (flight.tag !== '推荐') return;
    setExpandedAirline(prev => prev === flight.airline ? null : flight.airline);
  }, []);

  return (
    <div className="app-root">
      <Desktop />

      <LightFrame visible={lightOn} />

      <div className={"swipe-hint" + (lightOn && barProgress < 0.05 ? " in" : "")}>
        <div className="swipe-hint-arrow"></div>
        <div className="swipe-hint-text">向左滑出 AI</div>
      </div>

      <AICompanion
        open={barOpen}
        progress={barProgress}
        onClose={closeBar}
        onPointerDown={onPointerDown}
        aiState={aiState}
        onOrbPress={onOrbPress}
        expandedAirline={expandedAirline}
        onCardClick={onCardClick}
      />

      {lightOn && barProgress < 0.05 && (
        <div className="drag-zone-right"
             onMouseDown={onPointerDown}
             onTouchStart={onPointerDown} />
      )}
    </div>
  );
}

export default App;
