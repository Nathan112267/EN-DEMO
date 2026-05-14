import React from "react";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 2560;
const LONG_PRESS_MS = 620;
const LONG_PRESS_MOVE = 28;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
  };
}

function getStrokeLength(points) {
  return points.reduce((total, point, index) => {
    if (index === 0) return total;
    return total + distance(points[index - 1], point);
  }, 0);
}

function isUsefulCircle(points, bounds) {
  if (points.length < 10) return false;
  if (bounds.width < 90 || bounds.height < 90) return false;

  const aspect = bounds.width / bounds.height;
  if (aspect < 0.34 || aspect > 2.9) return false;

  const strokeLength = getStrokeLength(points);
  return strokeLength > (bounds.width + bounds.height) * 0.9;
}

function buildPath(points) {
  if (points.length < 2) return "";

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function DrawCircleLayer({ active, onComplete, onInvalid, onLongPress }) {
  const [points, setPoints] = React.useState([]);
  const [drawing, setDrawing] = React.useState(false);
  const [complete, setComplete] = React.useState(false);
  const svgRef = React.useRef(null);
  const pointsRef = React.useRef([]);
  const longPressTimerRef = React.useRef(null);
  const longPressOriginRef = React.useRef(null);
  const longPressFiredRef = React.useRef(false);

  const clearLongPress = React.useCallback(() => {
    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }, []);

  React.useEffect(() => {
    clearLongPress();
    longPressOriginRef.current = null;
    longPressFiredRef.current = false;

    if (!active) {
      pointsRef.current = [];
      setPoints([]);
      setDrawing(false);
      setComplete(false);
      return;
    }

    pointsRef.current = [];
    setPoints([]);
    setDrawing(false);
    setComplete(false);
  }, [active, clearLongPress]);

  React.useEffect(() => () => clearLongPress(), [clearLongPress]);

  const toLocal = React.useCallback((event) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = CANVAS_WIDTH / rect.width;
    const sy = CANVAS_HEIGHT / rect.height;

    return {
      x: (event.clientX - rect.left) * sx,
      y: (event.clientY - rect.top) * sy,
    };
  }, []);

  const resetStroke = React.useCallback(() => {
    clearLongPress();
    longPressOriginRef.current = null;
    longPressFiredRef.current = false;
    pointsRef.current = [];
    setPoints([]);
    setDrawing(false);
    setComplete(false);
  }, [clearLongPress]);

  const onDown = React.useCallback((event) => {
    if (complete) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = toLocal(event);
    if (!point) return;

    pointsRef.current = [point];
    setPoints([point]);
    setDrawing(true);
    longPressOriginRef.current = point;
    longPressFiredRef.current = false;

    if (onLongPress) {
      clearLongPress();
      longPressTimerRef.current = window.setTimeout(() => {
        const origin = longPressOriginRef.current;
        if (!origin) return;

        longPressFiredRef.current = true;
        onLongPress(origin);
        clearLongPress();
        longPressOriginRef.current = null;
        pointsRef.current = [];
        setPoints([]);
        setDrawing(false);
        setComplete(false);
      }, LONG_PRESS_MS);
    }
  }, [clearLongPress, complete, onLongPress, toLocal]);

  const onMove = React.useCallback((event) => {
    if (!drawing || complete) return;
    event.preventDefault();
    const point = toLocal(event);
    if (!point) return;

    const origin = longPressOriginRef.current;
    if (origin && distance(point, origin) > LONG_PRESS_MOVE) {
      clearLongPress();
    }

    if (longPressFiredRef.current) return;

    const current = pointsRef.current;
    const last = current[current.length - 1];
    if (last && distance(point, last) < 5) return;

    pointsRef.current = [...current, point];
    setPoints(pointsRef.current);
  }, [clearLongPress, complete, drawing, toLocal]);

  const finish = React.useCallback((event) => {
    clearLongPress();
    if (longPressFiredRef.current) {
      resetStroke();
      return;
    }

    if (!drawing) return;
    event?.preventDefault?.();
    event?.currentTarget?.releasePointerCapture?.(event.pointerId);

    setDrawing(false);
    const finalPoints = pointsRef.current;
    const bounds = finalPoints.length ? getBounds(finalPoints) : null;

    if (!bounds || !isUsefulCircle(finalPoints, bounds)) {
      resetStroke();
      onInvalid?.();
      return;
    }

    setComplete(true);
    window.setTimeout(() => {
      onComplete?.({ points: finalPoints, bounds });
      resetStroke();
    }, 220);
  }, [clearLongPress, drawing, onComplete, onInvalid, resetStroke]);

  const pathD = React.useMemo(() => buildPath(points), [points]);

  if (!active) return null;

  return (
    <div className={"circle-select-layer" + (complete ? " is-complete" : "")}>
      <svg
        ref={svgRef}
        className="circle-select-svg"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={finish}
        onPointerLeave={finish}
        onPointerCancel={finish}
      >
        <defs>
          <linearGradient id="circleSelectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff2d4" />
            <stop offset="52%" stopColor="#c83f31" />
            <stop offset="100%" stopColor="#7f2f27" />
          </linearGradient>
          <filter id="circleSelectGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {pathD && (
          <React.Fragment>
            <path
              className="circle-select-path glow"
              d={pathD}
              stroke="url(#circleSelectGrad)"
              strokeWidth="24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#circleSelectGlow)"
            />
            <path
              className="circle-select-path"
              d={pathD}
              stroke="url(#circleSelectGrad)"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </React.Fragment>
        )}
      </svg>
    </div>
  );
}

export default DrawCircleLayer;
