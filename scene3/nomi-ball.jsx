/* Nomi-style AI ball: glossy black sphere with simple oval eyes that look around + blink */

import React from "react";

const NomiBall = ({ size = 'large' }) => {
  const isLarge = size === 'large';
  return (
    <div className={`nomi-ball ${isLarge ? 'nomi-large' : 'nomi-small'}`}>
      <div className="nomi-body">
        <div className="nomi-face">
          <div className="nomi-eyes">
            <div className="nomi-eye left" />
            <div className="nomi-eye right" />
          </div>
        </div>
      </div>
      {isLarge && (
        <>
          <span className="nomi-spark s1" />
          <span className="nomi-spark s2" />
          <span className="nomi-spark s3" />
          <span className="nomi-spark s4" />
        </>
      )}
    </div>
  );
};

export default NomiBall;
