import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  detailCameraPos,
  detailLookAt,
  galaxyNodes,
  liveNodePosition,
  overviewCameraPos,
  overviewLookAt,
  sunDetailCameraPos,
  sunDetailLookAt,
  type GalaxyNode,
} from '../data/aadiData';
import { ModelFit } from './ModelFit';
import { SafeModel } from './SafeModel';

export type FocusTarget = number | 'sun' | null;

type SceneProps = {
  focusedTarget: FocusTarget;
  reducedMotion: boolean;
  hoveredId?: string | null;
  onAnchor?: (screen: { x: number; y: number } | null) => void;
  onPlanetHover?: (id: string | null) => void;
  onPlanetSelect?: (index: number) => void;
  onSunSelect?: () => void;
};

const planetWorld = new Map<number, THREE.Vector3>();

function cameraFacingYaw(cam: THREE.Camera, pos: THREE.Vector3) {
  const dx = cam.position.x - pos.x;
  const dz = cam.position.z - pos.z;
  return Math.atan2(dx, dz);
}

function setPointer(on: boolean) {
  document.body.style.cursor = on ? 'pointer' : '';
}

/** Transparent but raycastable hit volume — visible=false meshes are skipped by Three. */
function HitSphere({ radius }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CameraRig({
  focusedTarget,
  reducedMotion,
  onAnchor,
}: {
  focusedTarget: FocusTarget;
  reducedMotion: boolean;
  onAnchor?: SceneProps['onAnchor'];
}) {
  const { camera, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const look = useRef(new THREE.Vector3(...overviewLookAt));
  const targetPos = useRef(new THREE.Vector3(...overviewCameraPos));
  const targetLook = useRef(new THREE.Vector3(...overviewLookAt));
  const world = useRef(new THREE.Vector3());
  const ndc = useRef(new THREE.Vector3());
  const returning = useRef(false);

  useEffect(() => {
    if (focusedTarget == null) {
      // Smooth zoom back to overview instead of a hard snap.
      returning.current = true;
      targetPos.current.fromArray(overviewCameraPos);
      targetLook.current.fromArray(overviewLookAt);
    } else {
      returning.current = false;
    }
  }, [focusedTarget]);

  useFrame((_, delta) => {
    const focused = focusedTarget != null;
    if (controls.current) {
      // Keep controls off while zooming in/out so the lerp owns the camera.
      const settling =
        returning.current &&
        camera.position.distanceTo(targetPos.current) > 0.08;
      controls.current.enabled = !focused && !settling;
      if (!focused && !settling && returning.current) {
        controls.current.target.copy(look.current);
        controls.current.update();
        returning.current = false;
      }
    }

    if (focused) {
      if (focusedTarget === 'sun') {
        targetPos.current.fromArray(sunDetailCameraPos);
        targetLook.current.fromArray(sunDetailLookAt);
        world.current.set(0, 0.35, 0);
      } else {
        const tracked = planetWorld.get(focusedTarget);
        const live = tracked
          ? ([tracked.x, tracked.y, tracked.z] as [number, number, number])
          : liveNodePosition(focusedTarget, 0, true, true);
        world.current.fromArray(live);
        targetPos.current.fromArray(detailCameraPos(focusedTarget, live));
        targetLook.current.fromArray(detailLookAt(live));
      }
    } else if (returning.current) {
      targetPos.current.fromArray(overviewCameraPos);
      targetLook.current.fromArray(overviewLookAt);
      onAnchor?.(null);
    } else {
      onAnchor?.(null);
      return;
    }

    if (reducedMotion) {
      camera.position.copy(targetPos.current);
      look.current.copy(targetLook.current);
    } else {
      const ease = 1 - Math.exp(-delta * (focused ? 3.4 : 2.6));
      camera.position.lerp(targetPos.current, ease);
      look.current.lerp(targetLook.current, ease);
    }
    camera.lookAt(look.current);

    if (focused && onAnchor) {
      ndc.current.copy(world.current).project(camera);
      if (ndc.current.z < 1 && ndc.current.z > -1) {
        onAnchor({
          x: (ndc.current.x * 0.5 + 0.5) * size.width,
          y: (-ndc.current.y * 0.5 + 0.5) * size.height,
        });
      } else {
        onAnchor(null);
      }
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      zoomSpeed={0.85}
      minDistance={2.8}
      maxDistance={56}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI * 0.5}
      target={overviewLookAt}
    />
  );
}

function StaticStarField({
  count,
  radiusMin,
  radiusMax,
  size,
  opacity,
  palette,
  twinkle = false,
}: {
  count: number;
  radiusMin: number;
  radiusMax: number;
  size: number;
  opacity: number;
  palette: string[];
  twinkle?: boolean;
}) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = radiusMin + Math.random() * (radiusMax - radiusMin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      color.set(palette[i % palette.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count, radiusMin, radiusMax, palette]);

  const matRef = useRef<THREE.PointsMaterial>(null);
  useFrame(({ clock }) => {
    if (!twinkle || !matRef.current) return;
    matRef.current.opacity = opacity * (0.72 + Math.sin(clock.elapsedTime * 1.4) * 0.18);
  });

  return (
    <points geometry={points} raycast={() => null}>
      <pointsMaterial
        ref={matRef}
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function MilkyWaySky() {
  // Inward panorama — DoubleSide + no fog so it actually shows behind the system.
  return (
    <group scale={[-1, 1, 1]} renderOrder={-10}>
      <ModelFit url="./models/milkyway.glb" targetSize={240} skybox noRaycast />
    </group>
  );
}

function BeaconPulse({
  accent,
  hide,
  reducedMotion,
  scale = 1,
  y = 0.15,
}: {
  accent: string;
  hide: boolean;
  reducedMotion: boolean;
  scale?: number;
  y?: number;
}) {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (hide) {
      if (ringA.current) ringA.current.visible = false;
      if (ringB.current) ringB.current.visible = false;
      if (core.current) core.current.visible = false;
      return;
    }
    const t = clock.elapsedTime;
    const beep = reducedMotion ? 0.7 : 0.45 + 0.55 * Math.max(0, Math.sin(t * 3.2));
    if (core.current) {
      core.current.visible = true;
      core.current.scale.setScalar(0.85 + beep * 0.35);
      (core.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + beep * 0.55;
    }
    if (ringA.current) {
      ringA.current.visible = true;
      const p = (t * 0.55) % 1;
      ringA.current.scale.setScalar(1 + p * 2.2);
      (ringA.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.45;
    }
    if (ringB.current) {
      ringB.current.visible = true;
      const p = (t * 0.55 + 0.5) % 1;
      ringB.current.scale.setScalar(1 + p * 2.2);
      (ringB.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.35;
    }
  });

  return (
    <group position={[0, y, 0]} scale={scale} raycast={() => null}>
      <mesh ref={core} raycast={() => null}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function SunCore({
  focused,
  overview,
  reducedMotion,
  onPlanetHover,
  onSunSelect,
}: {
  focused: boolean;
  overview: boolean;
  reducedMotion: boolean;
  onPlanetHover?: (id: string | null) => void;
  onSunSelect?: () => void;
}) {
  const spin = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.y = clock.elapsedTime * 0.08;
  });

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        onPlanetHover?.('sun');
        setPointer(true);
      }}
      onPointerOut={() => {
        onPlanetHover?.(null);
        setPointer(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!overview) return;
        onSunSelect?.();
      }}
    >
      <group ref={spin}>
        <SafeModel fallbackColor="#ffb347" fallbackSize={2.85}>
          <ModelFit url="./models/sun.glb" targetSize={2.85} />
        </SafeModel>
      </group>
      {overview ? <HitSphere radius={3.4} /> : null}
      {overview ? (
        <Html
          position={[0, 3.5, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          zIndexRange={[20, 0]}
        >
          <div className="planetNameTag" style={{ ['--accent' as string]: '#ffb347' }}>
            The Core
          </div>
        </Html>
      ) : null}
      {!focused && overview && !reducedMotion ? (
        <BeaconPulse accent="#ffb347" hide={false} reducedMotion={reducedMotion} scale={2.9} y={3.1} />
      ) : null}
      <pointLight color="#ffc878" intensity={5.2} distance={32} />
      <pointLight color="#ff8844" intensity={2.6} distance={18} />
      <ambientLight intensity={0.1} color="#ffd8a0" />
    </group>
  );
}

function OrbitRing({
  radius,
  accent,
  inclination = 0,
}: {
  radius: number;
  accent: string;
  inclination?: number;
}) {
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const y = Math.sin(a) * Math.sin(inclination) * radius * 0.35;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.22 });
    const obj = new THREE.Line(geo, mat);
    obj.raycast = () => undefined;
    return obj;
  }, [radius, accent, inclination]);

  return (
    <group rotation={[0.08, 0, 0.04]}>
      <primitive object={line} />
    </group>
  );
}

function GlbPlanet({
  node,
  focused,
  overview,
  reducedMotion,
  orbitPaused,
  onPlanetHover,
  onPlanetSelect,
}: {
  node: GalaxyNode;
  focused: boolean;
  overview: boolean;
  reducedMotion: boolean;
  orbitPaused: boolean;
  onPlanetHover?: (id: string | null) => void;
  onPlanetSelect?: (index: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const baseAngle = useMemo(() => 0.4 + node.index * 0.7, [node.index]);
  const frozenAngle = useRef(baseAngle);
  const targetSize = node.size * (overview ? 1.35 : 1.7);
  const hitRadius = Math.max(targetSize * 0.95, 1.05);
  const tilt = node.orbitInclination ?? 0;
  const height = node.orbitHeight ?? 0;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    if (!orbitPaused && !reducedMotion) {
      frozenAngle.current = baseAngle + t * node.orbitSpeed;
    }
    const angle = frozenAngle.current;
    const r = node.orbitRadius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y =
      Math.sin(angle * 0.28) * 0.35 + Math.sin(angle) * Math.sin(tilt) * r * 0.35 + height;
    group.current.position.set(x, y, z);
    let tracked = planetWorld.get(node.index);
    if (!tracked) {
      tracked = new THREE.Vector3();
      planetWorld.set(node.index, tracked);
    }
    tracked.set(x, y, z);
    if (spin.current) {
      spin.current.rotation.y = t * 0.28;
      spin.current.scale.setScalar(focused ? 1.22 : 1);
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPlanetHover?.(node.id);
        setPointer(true);
      }}
      onPointerOut={() => {
        onPlanetHover?.(null);
        setPointer(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Only select from overview — must press Back to orbit first.
        if (!overview) return;
        onPlanetSelect?.(node.index);
      }}
    >
      <group ref={spin}>
        <SafeModel fallbackColor={node.accent} fallbackSize={targetSize}>
          <ModelFit url={node.model} targetSize={targetSize} />
        </SafeModel>
        {node.hasRing ? (
          <mesh rotation={[Math.PI / 2.35, 0.15, 0]} raycast={() => null}>
            <ringGeometry args={[targetSize * 0.7, targetSize * 0.95, 40]} />
            <meshBasicMaterial
              color={node.accent}
              transparent
              opacity={focused ? 0.4 : 0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ) : null}
      </group>
      {overview ? <HitSphere radius={hitRadius} /> : null}
      {overview ? (
        <Html
          position={[0, targetSize * 0.95 + 0.55, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          zIndexRange={[20, 0]}
        >
          <div className="planetNameTag" style={{ ['--accent' as string]: node.accent }}>
            {node.subtitle.split('·')[0].trim()}
          </div>
        </Html>
      ) : null}
      <pointLight color={node.accent} intensity={focused ? 2.4 : 0.85} distance={5} />
      <BeaconPulse
        accent={node.accent}
        hide={focused || !overview}
        reducedMotion={reducedMotion}
        y={targetSize * 0.65}
      />
    </group>
  );
}

/**
 * Sackboy only appears after the user selects a planet/sun —
 * summoned on the left side of the camera view, not parked on models.
 */
function SackboySummon({ focusedTarget }: { focusedTarget: FocusTarget }) {
  const group = useRef<THREE.Group>(null);
  const world = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const visible = focusedTarget != null;

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.visible = visible;
    if (!visible) return;

    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.matrixWorld.extractBasis(right, up, forward);
    // Place to the left of the view, slightly forward of the camera.
    const pos = camera.position
      .clone()
      .add(right.multiplyScalar(-2.1))
      .add(up.multiplyScalar(-0.35))
      .add(forward.multiplyScalar(-3.2));
    pos.y += Math.sin(clock.elapsedTime * 1.4) * 0.06;
    group.current.position.copy(pos);
    group.current.getWorldPosition(world.current);
    group.current.rotation.y = cameraFacingYaw(camera, world.current);
    group.current.scale.setScalar(0.55);
  });

  if (!visible) return null;

  return (
    <group ref={group} raycast={() => null}>
      <SafeModel fallbackColor="#f0c070" fallbackSize={0.55}>
        <ModelFit url="./models/sackboy.glb" targetSize={0.55} noRaycast />
      </SafeModel>
      <pointLight color="#ffe0a0" intensity={1.1} distance={2} position={[0, 0.15, 0.25]} />
    </group>
  );
}

type AmbientStreak = {
  playing: boolean;
  t: number;
  delay: number;
  speed: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  core: THREE.Mesh | null;
  glow: THREE.Mesh | null;
  bloom: THREE.Mesh | null;
  tmp: THREE.Vector3;
};

function AmbientShootingStars({ reducedMotion }: { reducedMotion: boolean }) {
  const slots = useRef<AmbientStreak[]>(
    Array.from({ length: 3 }, () => ({
      playing: false,
      t: 0,
      delay: 0,
      speed: 1.4,
      start: new THREE.Vector3(),
      end: new THREE.Vector3(),
      core: null,
      glow: null,
      bloom: null,
      tmp: new THREE.Vector3(),
    }))
  );
  const nextBurst = useRef(2.2 + Math.random() * 2);
  const timer = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    timer.current += delta;
    if (timer.current >= nextBurst.current) {
      timer.current = 0;
      nextBurst.current = 4.2 + Math.random() * 3.2;
      slots.current.forEach((slot, i) => {
        const side = Math.random() > 0.5 ? 1 : -1;
        slot.playing = true;
        slot.t = 0;
        slot.delay = i * (0.12 + Math.random() * 0.2);
        slot.speed = 1.15 + Math.random() * 0.4;
        slot.start.set(side * (12 + Math.random() * 6), 4 + Math.random() * 5, 2 + Math.random() * 6);
        slot.end.set(-side * (10 + Math.random() * 6), -2 - Math.random() * 4, -5 - Math.random() * 5);
        if (slot.core) slot.core.visible = false;
        if (slot.glow) slot.glow.visible = false;
        if (slot.bloom) slot.bloom.visible = false;
      });
    }

    slots.current.forEach((slot) => {
      if (!slot.playing || !slot.core || !slot.glow || !slot.bloom) return;
      if (slot.delay > 0) {
        slot.delay -= delta;
        return;
      }
      slot.t += delta * slot.speed;
      const p = Math.min(1, slot.t);
      const ease = p * p * (3 - 2 * p);
      slot.tmp.copy(slot.start).lerp(slot.end, ease);
      slot.core.visible = true;
      slot.glow.visible = true;
      slot.bloom.visible = true;
      slot.core.position.copy(slot.tmp);
      slot.glow.position.copy(slot.tmp);
      slot.bloom.position.copy(slot.tmp);
      const fade = p < 0.1 ? p / 0.1 : p > 0.75 ? (1 - p) / 0.25 : 1;
      (slot.core.material as THREE.MeshBasicMaterial).opacity = fade;
      (slot.glow.material as THREE.MeshBasicMaterial).opacity = 0.5 * fade;
      (slot.bloom.material as THREE.MeshBasicMaterial).opacity = 0.18 * fade;
      if (p >= 1) {
        slot.playing = false;
        slot.core.visible = false;
        slot.glow.visible = false;
        slot.bloom.visible = false;
      }
    });
  });

  return (
    <group raycast={() => null}>
      {slots.current.map((_, i) => (
        <group key={i}>
          <mesh
            ref={(m) => {
              if (slots.current[i]) slots.current[i].core = m;
            }}
            visible={false}
            raycast={() => null}
          >
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={1} depthWrite={false} />
          </mesh>
          <mesh
            ref={(m) => {
              if (slots.current[i]) slots.current[i].glow = m;
            }}
            visible={false}
            raycast={() => null}
          >
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial
              color="#ffe9b0"
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh
            ref={(m) => {
              if (slots.current[i]) slots.current[i].bloom = m;
            }}
            visible={false}
            raycast={() => null}
          >
            <sphereGeometry args={[0.28, 10, 10]} />
            <meshBasicMaterial
              color="#fff6d0"
              transparent
              opacity={0.18}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SceneContents({
  focusedTarget,
  reducedMotion,
  hoveredId,
  onAnchor,
  onPlanetHover,
  onPlanetSelect,
  onSunSelect,
}: SceneProps) {
  const overview = focusedTarget == null;

  return (
    <>
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#02030a', 90, 220]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#c8d4ff', '#1a1208', 0.65]} />
      <directionalLight position={[8, 14, 6]} intensity={1.2} color="#fff2d8" />
      <directionalLight position={[-8, 4, -6]} intensity={0.5} color="#8aa4ff" />

      <Suspense fallback={null}>
        <MilkyWaySky />
      </Suspense>

      <StaticStarField
        count={reducedMotion ? 500 : 1100}
        radiusMin={28}
        radiusMax={55}
        size={0.028}
        opacity={0.42}
        palette={['#c8d0e8', '#ffffff', '#b8c4e0']}
      />
      <StaticStarField
        count={reducedMotion ? 120 : 220}
        radiusMin={14}
        radiusMax={28}
        size={0.045}
        opacity={0.55}
        palette={['#ffffff', '#c9d4ff', '#f0e0c0']}
        twinkle={!reducedMotion}
      />

      <SunCore
        focused={focusedTarget === 'sun'}
        overview={overview}
        reducedMotion={reducedMotion}
        onPlanetHover={onPlanetHover}
        onSunSelect={onSunSelect}
      />

      {galaxyNodes.map((p) => (
        <OrbitRing
          key={`ring-${p.id}`}
          radius={p.orbitRadius}
          accent={p.accent}
          inclination={p.orbitInclination ?? 0}
        />
      ))}

      {galaxyNodes.map((node) => {
        const focused = focusedTarget === node.index;
        // Keep orbiting when selected — only ease pause on hover for aiming.
        const orbitPaused = hoveredId === node.id && !focused;
        return (
          <GlbPlanet
            key={node.id}
            node={node}
            focused={focused}
            overview={overview}
            reducedMotion={reducedMotion}
            orbitPaused={orbitPaused}
            onPlanetHover={onPlanetHover}
            onPlanetSelect={onPlanetSelect}
          />
        );
      })}

      <SackboySummon focusedTarget={focusedTarget} />

      <AmbientShootingStars reducedMotion={reducedMotion} />

      <CameraRig
        focusedTarget={focusedTarget}
        reducedMotion={reducedMotion}
        onAnchor={onAnchor}
      />
    </>
  );
}

useGLTF.preload('./models/sackboy.glb');
useGLTF.preload('./models/sun.glb');
useGLTF.preload('./models/milkyway.glb');
if (typeof window !== 'undefined' && window.innerWidth >= 720) {
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  const preloadRest = () => {
    useGLTF.preload('./models/planet-fire.glb');
    useGLTF.preload('./models/planet-stylized.glb');
    useGLTF.preload('./models/planet-alien.glb');
    useGLTF.preload('./models/planet-serendip.glb');
    useGLTF.preload('./models/planet-purple.glb');
    useGLTF.preload('./models/planet-techno.glb');
    useGLTF.preload('./models/planet-jupiter.glb');
    useGLTF.preload('./models/planet-lava.glb');
    useGLTF.preload('./models/planet-jupiter-baxter.glb');
    useGLTF.preload('./models/spaceship.glb');
  };
  if (idle) idle(preloadRest);
  else setTimeout(preloadRest, 800);
}

export function GalaxyScene({
  focusedTarget,
  reducedMotion,
  hoveredId,
  onAnchor,
  onPlanetHover,
  onPlanetSelect,
  onSunSelect,
}: SceneProps) {
  return (
    <div className="galaxyCanvas">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: overviewCameraPos, fov: 48, near: 0.1, far: 420 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none';
        }}
      >
        <SceneContents
          focusedTarget={focusedTarget}
          reducedMotion={reducedMotion}
          hoveredId={hoveredId}
          onAnchor={onAnchor}
          onPlanetHover={onPlanetHover}
          onPlanetSelect={onPlanetSelect}
          onSunSelect={onSunSelect}
        />
      </Canvas>
    </div>
  );
}
