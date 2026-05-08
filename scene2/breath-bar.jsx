/* Breath bar at top + tap hint */

import React from "react";

const BreathBar = ({ visible, showHint }) => {
  return (
    <div className={`breath-bar ${visible ? 'in' : ''}`}>
      <div className="glow" />
      <div className="core" />
      <div className="glow2" />
    </div>
  );
};

window.BreathBar = BreathBar;
export default BreathBar;
