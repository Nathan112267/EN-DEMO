/* DrawLayer: lets the user freehand-circle the screen during phase 1.
   Captures pointer events on a full-canvas overlay, renders a smooth
   stroke as the user drags, then triggers onComplete on release. */

import React from "react";

const DrawLayer = ({ active, onComplete }) => {
  const [points, setPoints] = React.useState([]);
  const [drawing, setDrawing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const svgRef = React.useRef(null);

  // reset whenever this layer is reactivated
  React.useEffect(() => {
    if (active) {
      setPoints([]);
      setDrawing(false);
      setDone(false);
    }
  }, [active]);

  // build smooth path via Catmull-Rom -> bezier (must run every render)
  const pathD = React.useMemo(() => {
    if (points.length < 2) return '';
    const pts = points;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }, [points]);

  if (!active) return null;

  const toLocal = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const sx = 1600 / r.width;
    const sy = 2560 / r.height;
    return {
      x: (e.clientX - r.left) * sx,
      y: (e.clientY - r.top) * sy,
    };
  };

  const onDown = (e) => {
    if (done) return;
    e.preventDefault();
    const p = toLocal(e);
    if (!p) return;
    setDrawing(true);
    setPoints([p]);
  };

  const onMove = (e) => {
    if (!drawing || done) return;
    const p = toLocal(e);
    if (!p) return;
    setPoints(prev => {
      const last = prev[prev.length - 1];
      // skip noise
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 4) return prev;
      return [...prev, p];
    });
  };

  const onUp = () => {
    if (!drawing) return;
    setDrawing(false);
    // require a minimum stroke length to count
    if (points.length < 8) {
      setPoints([]);
      return;
    }
    setDone(true);
    setTimeout(() => onComplete && onComplete(), 520);
  };

  // build smooth path via Catmull-Rom -> bezier
  // (moved above the early-return so hook order is stable)

  return (
    <div className={`draw-layer ${done ? 'is-done' : ''}`}>
      <svg
        ref={svgRef}
        className="draw-svg"
        viewBox="0 0 1600 2560"
        preserveAspectRatio="none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          <linearGradient id="dlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.92 0.18 250)"/>
            <stop offset="50%" stopColor="oklch(0.78 0.22 270)"/>
            <stop offset="100%" stopColor="oklch(0.85 0.18 320)"/>
          </linearGradient>
          <filter id="dlGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {pathD && (
          <React.Fragment>
            <path
              d={pathD}
              stroke="url(#dlGrad)"
              strokeWidth="22"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#dlGlow)"
              opacity="0.5"
            />
            <path
              d={pathD}
              stroke="url(#dlGrad)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </React.Fragment>
        )}
      </svg>
    </div>
  );
};

export default DrawLayer;
