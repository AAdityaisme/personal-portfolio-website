import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { galaxyNodes } from '../data/aadiData';
import { ModelFit } from './ModelFit';
import { SafeModel } from './SafeModel';

function MiniSun() {
  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.y = clock.elapsedTime * 0.2;
  });
  return (
    <group ref={spin}>
      <SafeModel fallbackColor="#ffb347" fallbackSize={1.15}>
        <ModelFit url="./models/sun.glb" targetSize={1.15} />
      </SafeModel>
      <pointLight color="#ffc878" intensity={3} distance={8} />
    </group>
  );
}

function MiniPlanet({
  radius,
  speed,
  size,
  model,
  accent,
  phase,
}: {
  radius: number;
  speed: number;
  size: number;
  model: string;
  accent: string;
  phase: number;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const a = phase + clock.elapsedTime * speed;
    group.current.position.set(Math.cos(a) * radius, Math.sin(a * 0.4) * 0.12, Math.sin(a) * radius);
    group.current.rotation.y = clock.elapsedTime * 0.4;
  });
  return (
    <group ref={group}>
      <SafeModel fallbackColor={accent} fallbackSize={size}>
        <ModelFit url={model} targetSize={size} />
      </SafeModel>
    </group>
  );
}

function MiniScene() {
  const planets = useMemo(
    () =>
      galaxyNodes.slice(0, 7).map((n, i) => ({
        id: n.id,
        radius: 1.5 + i * 0.48,
        speed: 0.18 + (i % 3) * 0.05,
        size: 0.32 + (n.size % 0.3) * 0.4,
        model: n.model,
        accent: n.accent,
        phase: i * 0.9,
      })),
    []
  );

  return (
    <>
      <color attach="background" args={['#05070f']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 2]} intensity={0.9} color="#fff2d8" />
      <MiniSun />
      {planets.map((p) => (
        <MiniPlanet key={p.id} {...p} />
      ))}
    </>
  );
}

type Props = {
  onEnter: () => void;
};

/** Full-viewport Enter Galaxy CTA — same typography language as the site. */
export function MiniGalaxy({ onEnter }: Props) {
  return (
    <section className="galaxyGate" aria-label="Enter galaxy mode">
      <div className="galaxyGateCanvas" aria-hidden="true">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [5.2, 3.2, 6.4], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <MiniScene />
          </Suspense>
        </Canvas>
      </div>
      <div className="galaxyGateScrim" aria-hidden="true" />
      <button type="button" className="galaxyGateHit" onClick={onEnter}>
        <motion.div
          className="galaxyGateCopy"
          animate={{ opacity: [0.72, 1, 0.72], y: [0, -6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="edEyebrow">Interactive orbit</p>
          <h2 className="galaxyGateTitle">Enter Galaxy</h2>
          <p className="galaxyGateBody">
            Full 3D orbit — drag, look around, open any world.
          </p>
          <span className="galaxyGateCta">Tap anywhere to enter</span>
        </motion.div>
      </button>
    </section>
  );
}

useGLTF.preload('./models/sun.glb');
