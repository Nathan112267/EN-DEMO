// Main app: orchestrates desktop and notification shade. Manual pull only.
const { useState: aUseState, useEffect: aUseEffect, useRef: aUseRef, useCallback: aUseCallback } = React;

function App() {
  const [tasks, setTasks] = aUseState(window.TASKS_INITIAL);
  const [pullProgress, setPullProgress] = aUseState(0);  // 0..1
  const [open, setOpen] = aUseState(false);
  const dragRef = aUseRef({ active: false, startY: 0, startProgress: 0, moved: false });

  // Live progress updates
  aUseEffect(() => {
    const id = setInterval(() => {
      setTasks(prev => prev.map(t => {
        const inc = (0.002 + Math.random() * 0.010);
        let next = t.progress + inc;
        if (next > 0.97) next = 0.18 + Math.random() * 0.2;
        return { ...t, progress: next };
      }));
    }, 280);
    return () => clearInterval(id);
  }, []);

  const animateTo = aUseCallback((from, to, dur=380) => {
    const start = performance.now();
    // Use a softer ease-in-out for closing (going up), ease-out for opening
    const closing = to < from;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      let eased;
      if (closing) {
        // ease-in-out cubic: gentle start, accelerate, decelerate
        eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      } else {
        // ease-out cubic for opening
        eased = 1 - Math.pow(1 - t, 3);
      }
      const v = from + (to - from) * eased;
      setPullProgress(v);
      if (t < 1) requestAnimationFrame(tick);
      else setOpen(to >= 1);
    };
    requestAnimationFrame(tick);
  }, []);

  const onPointerDown = aUseCallback((e) => {
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    dragRef.current = { active: true, startY: y, startProgress: open ? 1 : pullProgress, moved: false };
  }, [open, pullProgress]);

  const onPointerMove = aUseCallback((e) => {
    if (!dragRef.current.active) return;
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dy = y - dragRef.current.startY;
    if (Math.abs(dy) > 4) dragRef.current.moved = true;
    const vh = window.innerHeight;
    const delta = dy / (vh * 0.55);
    let p = dragRef.current.startProgress + delta;
    p = Math.max(0, Math.min(1, p));
    setPullProgress(p);
  }, []);

  const onPointerUp = aUseCallback(() => {
    if (!dragRef.current.active) return;
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    if (!moved) return;
    setPullProgress(p => {
      const target = p > 0.4 ? 1 : 0;
      const dur = target === 0 ? 560 : 420;
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

  const closeShade = () => animateTo(open ? 1 : pullProgress, 0, 620);

  return (
    <div className="app-root">
      <window.Desktop />

      <window.NotificationShade
        open={open}
        progress={pullProgress}
        tasks={tasks}
        onClose={closeShade}
      />

      {/* Top edge drag zone — taller, higher z to ensure capture */}
      <div className="drag-zone-top"
           onMouseDown={onPointerDown}
           onTouchStart={onPointerDown} />

      {/* Whole-shade drag zone when open */}
      {(open || pullProgress > 0.05) && (
        <div className="drag-zone-shade"
             onMouseDown={onPointerDown}
             onTouchStart={onPointerDown} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
