// Purple/blue AI breathing light along the four edges of the screen.
import React from "react";

function LightFrame({ visible }) {
  return (
    <div className={"light-frame" + (visible ? " in" : "")}>
      <div className="light-edge top"></div>
      <div className="light-edge bottom"></div>
      <div className="light-edge left"></div>
      <div className="light-edge right"></div>
      <div className="light-corner tl"></div>
      <div className="light-corner tr"></div>
      <div className="light-corner bl"></div>
      <div className="light-corner br"></div>
    </div>
  );
}

window.LightFrame = LightFrame;
export default LightFrame;
