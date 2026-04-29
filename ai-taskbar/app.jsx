import React, { useCallback, useEffect, useRef, useState } from "react";
import Desktop from "./desktop.jsx";
import NotificationShade, { TASKS_INITIAL } from "./notification-shade.jsx";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 2560;

export default function App() {
  const [tasks, setTasks] = useState(TASKS_INITIAL);
  const [pullProgress, setPullProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const canvasRef = useRef(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startY: 0,
    startProgress: 0,
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTasks((previous) =>
        previous.map((task) => {
          const increment = 0.002 + Math.random() * 0.01;
          let nextProgress = task.progress + increment;

          if (nextProgress > 0.97) {
            nextProgress = 0.18 + Math.random() * 0.2;
          }

          return { ...task, progress: nextProgress };
        })
      );
    }, 280);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fitCanvas = () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const scaleX = window.innerWidth / CANVAS_WIDTH;
      const scaleY = window.innerHeight / CANVAS_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };

    fitCanvas();
    window.addEventListener("resize", fitCanvas);

    return () => window.removeEventListener("resize", fitCanvas);
  }, []);

  const animateTo = useCallback((from, to, duration = 380) => {
    const start = performance.now();
    const closing = to < from;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = closing
        ? progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
        : 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;

      setPullProgress(value);

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      setOpen(to >= 1);
    };

    requestAnimationFrame(tick);
  }, []);

  const onPointerDown = useCallback(
    (event) => {
      const clientY =
        "touches" in event ? event.touches[0]?.clientY ?? 0 : event.clientY;

      dragRef.current = {
        active: true,
        moved: false,
        startY: clientY,
        startProgress: open ? 1 : pullProgress,
      };
    },
    [open, pullProgress]
  );

  const onPointerMove = useCallback((event) => {
    if (!dragRef.current.active) {
      return;
    }

    const clientY =
      "touches" in event ? event.touches[0]?.clientY ?? 0 : event.clientY;
    const deltaY = clientY - dragRef.current.startY;

    if (Math.abs(deltaY) > 4) {
      dragRef.current.moved = true;
    }

    const delta = deltaY / (window.innerHeight * 0.55);
    const progress = Math.max(
      0,
      Math.min(1, dragRef.current.startProgress + delta)
    );

    setPullProgress(progress);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) {
      return;
    }

    const moved = dragRef.current.moved;
    dragRef.current.active = false;

    if (!moved) {
      return;
    }

    setPullProgress((currentProgress) => {
      const target = currentProgress > 0.4 ? 1 : 0;
      const duration = target === 0 ? 560 : 420;
      animateTo(currentProgress, target, duration);
      return currentProgress;
    });
  }, [animateTo]);

  useEffect(() => {
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const closeShade = useCallback(() => {
    animateTo(open ? 1 : pullProgress, 0, 620);
  }, [animateTo, open, pullProgress]);

  return (
    <div id="stage">
      <div id="canvas" ref={canvasRef}>
        <div className="stars" />
        <div className="app-root">
          <Desktop />

          <NotificationShade
            open={open}
            progress={pullProgress}
            tasks={tasks}
            onClose={closeShade}
          />

          <div
            className="drag-zone-top"
            onMouseDown={onPointerDown}
            onTouchStart={onPointerDown}
          />

          {(open || pullProgress > 0.05) && (
            <div
              className="drag-zone-shade"
              onMouseDown={onPointerDown}
              onTouchStart={onPointerDown}
            />
          )}
        </div>
      </div>
    </div>
  );
}
