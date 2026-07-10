import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type Props = {
  url: string;
  targetSize?: number;
  /** Skip raycasting (skyboxes / decoration). */
  noRaycast?: boolean;
  /** Panorama / skybox: double sided, no fog, never frustum culled. */
  skybox?: boolean;
};

function tuneMaterial(mat: THREE.Material, accentHint?: string, skybox = false) {
  const m = mat as THREE.MeshStandardMaterial;
  if (skybox) {
    m.side = THREE.DoubleSide;
    m.depthWrite = false;
    m.fog = false;
    if ('toneMapped' in m) m.toneMapped = false;
    m.needsUpdate = true;
    return;
  }
  if ('metalness' in m) m.metalness = Math.min(Number(m.metalness ?? 0.2), 0.35);
  if ('roughness' in m) m.roughness = Math.max(Number(m.roughness ?? 0.55), 0.35);
  if ('emissive' in m && m.emissive) {
    const e = m.emissive;
    if (e.r + e.g + e.b < 0.05) {
      e.set(accentHint ?? '#445566');
      m.emissiveIntensity = Math.max(m.emissiveIntensity ?? 0, 0.12);
    }
  }
  if ('color' in m && m.color) {
    const c = m.color;
    if (c.r + c.g + c.b < 0.04) {
      c.set(accentHint ?? '#6a7a90');
    }
  }
  m.side = THREE.FrontSide;
  m.needsUpdate = true;
}

/** Load a GLB, center it, scale it, and keep materials lit / clickable. */
export function ModelFit({ url, targetSize = 1, noRaycast = false, skybox = false }: Props) {
  const { scene } = useGLTF(url);
  const { cloned, offset, scale } = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.frustumCulled = !skybox;
        if (noRaycast || skybox) {
          mesh.raycast = () => undefined;
        }
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat) tuneMaterial(mat, undefined, skybox);
        });
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return {
      cloned: c,
      offset: center.clone().multiplyScalar(-1),
      scale: targetSize / maxDim,
    };
  }, [scene, targetSize, noRaycast, skybox]);

  return (
    <group scale={scale}>
      <group position={[offset.x, offset.y, offset.z]}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

export function FallbackPlanet({ color = '#8899aa', size = 1 }: { color?: string; size?: number }) {
  return (
    <mesh>
      <sphereGeometry args={[size * 0.5, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.5} />
    </mesh>
  );
}
