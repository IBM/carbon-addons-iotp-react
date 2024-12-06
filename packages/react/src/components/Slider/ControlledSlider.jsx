import React, { useState } from 'react';

import { Slider } from '.';

export const ControlledSlider = () => {
  const [val, setVal] = useState(87);
  return (
    <>
      <button type="button" onClick={() => setVal(Math.round(Math.random() * 100))}>
        randomize value
      </button>
      <Slider max={100} min={0} value={val} onChange={({ value }) => setVal(value)} />
      <h1>{val}</h1>
    </>
  );
};
