import { useState } from 'react';
import gsap from 'gsap';
import type { MotionState } from '../../lib/motion/constants';

export type DebugApi = {
  replayLoader: () => void;
  replayAssembly: () => void;
  goCurved: () => void;
  morphGrid: () => void;
  selectProject: () => void;
  replayFragment: () => void;
  replayWork: () => void;
  toggleHoverSim: () => void;
};

type Props = {
  api: DebugApi;
  motionState: MotionState;
};

/** Development-only tuning panel — hidden from production builds. */
export function DebugPanel({ api, motionState }: Props) {
  const [open, setOpen] = useState(false);
  const [, bump] = useState(0);
  const d = motionState.debug;

  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void
  ) => (
    <label className="akxDbgRow">
      <span>
        {label} <em>{value.toFixed(2)}</em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value));
          bump((n) => n + 1);
        }}
      />
    </label>
  );

  return (
    <div className={`akxDbg ${open ? 'isOpen' : ''}`}>
      <button type="button" className="akxDbgToggle" onClick={() => setOpen((o) => !o)}>
        {open ? '× debug' : '⚙ debug'}
      </button>
      {open ? (
        <div className="akxDbgBody">
          <div className="akxDbgButtons">
            <button onClick={api.replayLoader}>Replay loader</button>
            <button onClick={api.replayAssembly}>Replay assembly</button>
            <button onClick={api.goCurved}>Curved portfolio</button>
            <button onClick={api.morphGrid}>Morph to grid</button>
            <button onClick={api.selectProject}>Select project</button>
            <button onClick={api.replayFragment}>Fragment transition</button>
            <button onClick={api.replayWork}>Work intro</button>
            <button onClick={api.toggleHoverSim}>Toggle hover sim</button>
          </div>
          {slider('Shadow strength', d.shadowStrength, 0, 2, 0.05, (v) => (d.shadowStrength = v))}
          {slider('Reflection opacity', d.reflectionOpacity, 0, 0.6, 0.01, (v) => (d.reflectionOpacity = v))}
          {slider('Curvature', d.curveAmount, 0, 2, 0.05, (v) => (d.curveAmount = v))}
          {slider('Fragment count', d.fragmentCount, 24, 96, 2, (v) => (d.fragmentCount = v))}
          {slider('Speed', gsap.globalTimeline.timeScale(), 0.1, 2, 0.05, (v) =>
            gsap.globalTimeline.timeScale(v)
          )}
        </div>
      ) : null}
    </div>
  );
}
