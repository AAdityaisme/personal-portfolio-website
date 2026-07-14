import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { ModelFit } from './ModelFit';
import { SafeModel } from './SafeModel';

type Props = {
  onEnter: () => void;
};

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

function FastSpinSun({ boost }: { boost: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const speed = boost ? 1.8 : 0.55;
    group.current.rotation.y += delta * speed;
    group.current.rotation.x += delta * speed * 0.12;
  });
  return (
    <group ref={group}>
      <SafeModel fallbackColor="#ffb347" fallbackSize={2.4}>
        <ModelFit url="./models/sun.glb" targetSize={2.4} />
      </SafeModel>
      <pointLight color="#ffc878" intensity={boost ? 6 : 3.6} distance={12} />
    </group>
  );
}

/** Full-viewport Enter Galaxy CTA — big orbit label, spinning sun behind title. */
export function MiniGalaxy({ onEnter }: Props) {
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(() => onEnter(), 780);
  };

  return (
    <section
      className={`galaxyGate ${entering ? 'isEntering' : ''}`}
      aria-label="Enter galaxy mode"
      style={{ backgroundImage: 'url(./images/galaxy-gate.png)' }}
    >
      <div className="galaxyGateScrim" aria-hidden="true" />

      <div className="galaxyGateSun" aria-hidden="true">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4.2], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 2, 3]} intensity={1.1} color="#fff2d0" />
          <Suspense fallback={null}>
            <FastSpinSun boost={entering} />
          </Suspense>
        </Canvas>
      </div>

      <button type="button" className="galaxyGateHit" onClick={handleEnter}>
        <motion.div
          className="galaxyGateCopy"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.2, ease: easeOut }}
        >
          <motion.p
            className="galaxyGateOrbit"
            animate={
              entering
                ? { opacity: 0, y: -28, scale: 1.08 }
                : { opacity: [0.88, 1, 0.88], y: [0, -6, 0] }
            }
            transition={
              entering
                ? { duration: 0.55, ease: easeOut }
                : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            Interactive orbit
          </motion.p>

          <div className="galaxyGateTitleStack">
            <motion.h2
              className="galaxyGateTitle"
              animate={
                entering
                  ? { opacity: 0, scale: 1.35, filter: 'blur(8px)' }
                  : { opacity: 1, scale: 1, filter: 'blur(0px)' }
              }
              transition={{ duration: 0.7, ease: easeOut }}
            >
              Enter Galaxy
            </motion.h2>
          </div>

          <motion.p
            className="galaxyGateBody"
            animate={entering ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            Full 3D orbit — drag, look around, open any world.
          </motion.p>
          <motion.span
            className="galaxyGateCta"
            animate={entering ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            Tap anywhere to enter
          </motion.span>
        </motion.div>
      </button>

      <AnimatePresence>
        {entering ? (
          <motion.div
            className="galaxyGateFlash"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.85, 1], scale: [0.7, 1.15, 1.45] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: easeOut }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

useGLTF.preload('./models/sun.glb');
