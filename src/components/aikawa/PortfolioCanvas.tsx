import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitCategory } from '../../data/aikawaData';
import {
  GRID_CELLS,
  STRIP,
  selectRect,
  stripWidthFraction,
  wrapOffset,
  type MotionState,
} from '../../lib/motion/constants';
import { panelFragment, panelVertex, reflectionFragment } from '../../lib/three/shaders';

export type PanelPointerEvent = {
  index: number;
  uv: { x: number; y: number } | null;
  clientX: number;
  clientY: number;
};

type SceneProps = {
  categories: OrbitCategory[];
  motionState: MotionState;
  onPanelPointer: (e: PanelPointerEvent) => void;
  onPanelClick: (index: number) => void;
};

const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
const smoothstepNum = (edge0: number, edge1: number, x: number) =>
  THREE.MathUtils.smoothstep(x, edge0, edge1);

/**
 * uv scale that crops (cover) or letterboxes (contain) an image into a panel
 * of the given on-screen aspect. Computed per frame so non-uniform panel
 * scaling (grid cells, selection, morphs) never stretches the picture.
 */
function fitScale(
  imgAspect: number,
  fit: 'cover' | 'contain',
  panelAspect: number
): readonly [number, number] {
  if (fit === 'contain') {
    const m = 0.82;
    if (imgAspect > panelAspect) return [1 / m, imgAspect / (m * panelAspect)] as const;
    return [panelAspect / (imgAspect * m), 1 / m] as const;
  }
  if (imgAspect > panelAspect) return [panelAspect / imgAspect, 1] as const;
  return [1, imgAspect / panelAspect] as const;
}

function Panel({
  category,
  texture,
  index,
  count,
  motionState,
  onPanelPointer,
  onPanelClick,
}: {
  category: OrbitCategory;
  texture: THREE.Texture;
  index: number;
  count: number;
  motionState: MotionState;
  onPanelPointer: (e: PanelPointerEvent) => void;
  onPanelClick: (index: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const panelMat = useRef<THREE.ShaderMaterial>(null);
  const mirrorMat = useRef<THREE.ShaderMaterial>(null);
  const hoverAmt = useRef(0);
  const { viewport } = useThree();

  const W = viewport.width * stripWidthFraction();
  const H = W * STRIP.aspect;
  // Reference geometry: cards span the full cylinder — angleStep = 2π/count,
  // radius chosen so adjacent cards (plus gap) nearly touch on the arc.
  const angleStep = (Math.PI * 2) / count;
  const radius = (W * (1 + STRIP.gap)) / angleStep;
  const panelAspect = W / H;

  const bg = useMemo(() => new THREE.Color(category.imageBg ?? '#e8e6e1'), [category.imageBg]);
  const imgAspect = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    return img?.width && img?.height ? img.width / img.height : panelAspect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture]);

  const panelUniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uBg: { value: bg },
      uOpacity: { value: 1 },
      uBrightness: { value: 1 },
      uScale: { value: new THREE.Vector2(1, 1) },
      uShift: { value: new THREE.Vector2(0, 0) },
      uCurvature: { value: 0 },
      uRadius: { value: radius },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uHoverStrength: { value: 0 },
      uGlassEdge: { value: 0 },
      uGlassPointer: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture]
  );
  const mirrorUniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uBg: { value: bg },
      uOpacity: { value: 0 },
      uScale: { value: new THREE.Vector2(1, 1) },
      uShift: { value: new THREE.Vector2(0, 0) },
      uCurvature: { value: 0 },
      uRadius: { value: radius },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uHoverStrength: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture]
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !panelMat.current || !mirrorMat.current) return;
    const ms = motionState;
    const vpW = viewport.width;
    const vpH = viewport.height;
    const pxToWorld = vpH / window.innerHeight;

    const offset = wrapOffset(index - ms.active.value, count);
    const rounded = Math.round(offset);
    const isActive = Math.abs(offset) < 0.5;
    const isSelected = index === ms.selectedIndex;

    // --- Cylinder pose (reference: angle = offset*step, axis at z = −radius) --
    const theta = clamp(offset, -count / 2, count / 2) * angleStep;
    const span = W * (1 + STRIP.gap);
    // Flat filmstrip pose (splash) blends into the wrapped cylinder pose.
    const wv = ms.wrap.value;
    const cX = lerp(offset * span, Math.sin(theta) * radius, wv);
    const cZ = lerp(0, (Math.cos(theta) - 1) * radius, wv);
    const cYaw = -theta * wv;
    const cScale = 1;
    // Cards behind the cylinder's equator fade so they never ghost through.
    const behind = smoothstepNum(Math.PI * 0.52, Math.PI * 0.72, Math.abs(theta) * wv);
    let opacity = 1 - behind;
    if (!isActive) opacity *= ms.reveal.value;

    // --- Grid pose ----------------------------------------------------------
    const cell = GRID_CELLS[rounded] ?? GRID_CELLS[0];
    const gX = (cell.cx - 0.5) * vpW;
    const gY = (0.5 - cell.cy) * vpH;
    const gSx = (cell.w * vpW) / W;
    const gSy = (cell.h * vpH) / H;

    const gv = ms.grid.value;
    const sv = ms.select.value;

    let x = lerp(cX, gX, gv);
    let y = lerp(0, gY, gv);
    let z = lerp(cZ, 0.001 * rounded, gv);
    let yaw = cYaw * (1 - gv);
    let sx = lerp(cScale, gSx, gv);
    let sy = lerp(cScale, gSy, gv);
    opacity = lerp(opacity, cell.pale ? 0.85 : 1, gv);
    let brightness = lerp(1, cell.pale ? 1.16 : 1, gv);

    // --- Selection pose -----------------------------------------------------
    if (sv > 0.001) {
      if (isSelected) {
        const sr = selectRect();
        x = lerp(x, (sr.cx - 0.5) * vpW, sv);
        y = lerp(y, (0.5 - sr.cy) * vpH, sv);
        z = lerp(z, 0.01, sv);
        sx = lerp(sx, (sr.w * vpW) / W, sv);
        sy = lerp(sy, (sr.h * vpH) / H, sv);
        opacity = lerp(opacity, 1, sv);
        brightness = lerp(brightness, 1, sv);
      } else {
        const dir = Math.sign(x) || (y > 0 ? 0 : 1);
        x += dir * sv * 60 * pxToWorld;
        y += (y > 0 ? 1 : -1) * sv * 24 * pxToWorld;
        sx *= 1 - sv * 0.06;
        sy *= 1 - sv * 0.06;
        opacity *= 1 - sv;
      }
    }

    // --- Hover --------------------------------------------------------------
    const curvedHover = ms.hoverActive && isActive && gv < 0.5;
    const gridHover = ms.hoverPanel === index && gv > 0.5 && sv < 0.5;
    const hoverTarget = curvedHover || gridHover ? 1 : 0;
    hoverAmt.current += (hoverTarget - hoverAmt.current) * Math.min(1, dt * 7);
    const hv = hoverAmt.current;

    if (gv > 0.5 && ms.hoverPanel >= 0 && ms.hoverPanel !== index && sv < 0.5) {
      opacity *= 0.82; // soften the other tiles
    }
    if (gridHover) {
      brightness = lerp(brightness, 1.025, hv);
      sx *= 1 + 0.018 * hv;
      sy *= 1 + 0.018 * hv;
    }

    const localX = ms.pointerUv.x - 0.5;
    const localY = ms.pointerUv.y - 0.5;
    if (gv < 0.5) {
      y += ms.lift.value * pxToWorld * (isActive ? 1 : 0);
      yaw += localX * 0.035 * hv * (curvedHover ? 1 : 0);
    }
    const pitch = -localY * -0.026 * hv * (curvedHover ? 1 : 0);

    if (ms.panelHidden && isSelected) opacity = 0;

    g.position.set(x, y, z);
    g.rotation.set(pitch, yaw, 0);
    g.scale.set(sx, sy, 1);

    // --- Uniforms -----------------------------------------------------------
    // R3F clones the uniforms prop at construction, so write through the
    // material refs — the memo objects only seed the initial values.
    const curvature = ms.curvature.value * (1 - gv) * ms.debug.curveAmount;
    // Fit the image to the panel's CURRENT on-screen aspect so grid cells,
    // selection and morphs crop instead of stretching the picture.
    const effAspect = (W * sx) / (H * sy);
    const [fitX, fitY] = fitScale(imgAspect, category.imageFit, effAspect);

    const pu = panelMat.current.uniforms as typeof panelUniforms;
    // Surface bend radius equals the cylinder radius so wrapped cards read
    // as one continuous drum; bend follows the wrap blend during the intro.
    pu.uRadius.value = radius;
    pu.uCurvature.value = curvature * wv;
    pu.uOpacity.value = opacity;
    pu.uBrightness.value = brightness;
    pu.uScale.value.set(fitX, fitY);
    pu.uShift.value.set(localX * -0.014 * hv, localY * -0.01 * hv);
    pu.uHoverStrength.value = curvedHover || hv > 0.01 ? 0.05 * W * hv * (gv < 0.5 ? 1 : 0.3) : 0;
    pu.uPointer.value.set(
      hv > 0.01 ? ms.pointerUv.x : -10,
      hv > 0.01 ? ms.pointerUv.y : -10
    );
    // Integrated card glass: edge highlight always faint; pointer specular
    // only while hovering the front card (reference card:glass:edge ≈ 0.34).
    pu.uGlassEdge.value = 0.34 * (1 - gv) * opacity * (isActive ? 1 : 0.5);
    pu.uGlassPointer.value = curvedHover ? 0.12 * hv : 0;

    const mu = mirrorMat.current.uniforms as typeof mirrorUniforms;
    mu.uRadius.value = radius;
    mu.uCurvature.value = curvature * wv;
    mu.uScale.value.set(fitX, fitY);
    mu.uShift.value.copy(pu.uShift.value);
    const hoverDim = curvedHover ? lerp(1, 0.17 / 0.22, hv) : 1;
    mu.uOpacity.value =
      ms.reflection.value *
      ms.debug.reflectionOpacity *
      (opacity / Math.max(0.001, 1)) *
      (1 - gv) *
      (1 - sv) *
      hoverDim *
      (ms.panelHidden && isSelected ? 0 : 1);
  });

  const gapWorld = (STRIP.reflectionGap / window.innerHeight) * viewport.height;
  const mirrorY = -H / 2 - gapWorld - (H * STRIP.reflectionScale) / 2;

  return (
    <group ref={group}>
      <mesh
        onPointerMove={(e) => {
          e.stopPropagation();
          onPanelPointer({
            index,
            uv: e.uv ? { x: e.uv.x, y: e.uv.y } : null,
            clientX: e.clientX,
            clientY: e.clientY,
          });
        }}
        onPointerOut={() => onPanelPointer({ index, uv: null, clientX: 0, clientY: 0 })}
        onClick={(e) => {
          e.stopPropagation();
          onPanelClick(index);
        }}
      >
        <planeGeometry args={[W, H, 72, 8]} />
        <shaderMaterial
          ref={panelMat}
          vertexShader={panelVertex}
          fragmentShader={panelFragment}
          uniforms={panelUniforms}
          transparent
        />
      </mesh>
      <mesh position={[0, mirrorY, 0]} scale={[1, STRIP.reflectionScale, 1]}>
        <planeGeometry args={[W, H, 72, 8]} />
        <shaderMaterial
          ref={mirrorMat}
          vertexShader={panelVertex}
          fragmentShader={reflectionFragment}
          uniforms={mirrorUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function StripScene({ categories, motionState, onPanelPointer, onPanelClick }: SceneProps) {
  const textures = useLoader(
    THREE.TextureLoader,
    categories.map((c) => c.image)
  );
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });

  return (
    <>
      {categories.map((cat, i) => (
        <Panel
          key={cat.id}
          category={cat}
          texture={textures[i]}
          index={i}
          count={categories.length}
          motionState={motionState}
          onPanelPointer={onPanelPointer}
          onPanelClick={onPanelClick}
        />
      ))}
    </>
  );
}

export function PortfolioCanvas(props: SceneProps) {
  return (
    <Canvas
      className="akxCanvas"
      camera={{ position: [0, 0, 9], fov: 46, near: 0.1, far: 60 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <StripScene {...props} />
    </Canvas>
  );
}
