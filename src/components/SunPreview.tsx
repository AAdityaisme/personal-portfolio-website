import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ModelFit } from './ModelFit';
import { SafeModel } from './SafeModel';

function SpinningSun({ size }: { size: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.18;
  });
  return (
    <group ref={group}>
      <SafeModel fallbackColor="#ffb347" fallbackSize={size}>
        <ModelFit url="./models/sun.glb" targetSize={size} />
      </SafeModel>
      <pointLight color="#ffc878" intensity={2.8} distance={8} />
    </group>
  );
}

type Props = {
  onClick?: () => void;
  compact?: boolean;
  className?: string;
  label?: string;
};

/** Real sun GLB for the editorial site — clickable entry into galaxy mode. */
export function SunPreview({ onClick, compact = false, className = '', label }: Props) {
  const size = compact ? 1.35 : 1.85;

  return (
    <button
      type="button"
      className={`sunPreviewBtn ${compact ? 'isCompact' : ''} ${className}`}
      onClick={onClick}
      aria-label={label ?? 'Enter galaxy mode'}
    >
      <div className="sunPreviewCanvas">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[2, 2, 3]} intensity={0.8} color="#fff2d0" />
          <Suspense fallback={null}>
            <SpinningSun size={size} />
          </Suspense>
        </Canvas>
      </div>
      <span className="sunPreviewPulse" aria-hidden="true" />
      <span className="sunPreviewRing" aria-hidden="true" />
    </button>
  );
}

useGLTF.preload('./models/sun.glb');
