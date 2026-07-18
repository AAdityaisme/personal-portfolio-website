/**
 * Curved-panel shaders. The plane is authored flat; the vertex stage bends it
 * around a shallow cylinder and mixes flat↔curved with uCurvature so the
 * grid morph is a pure uniform tween. Hover adds a soft local bulge.
 */
export const panelVertex = /* glsl */ `
uniform float uCurvature;
uniform float uRadius;
uniform vec2 uPointer;
uniform float uHoverStrength;
uniform float uWave;
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;

  float theta = p.x / uRadius;
  vec3 curved = vec3(sin(theta) * uRadius, p.y, (cos(theta) - 1.0) * uRadius + p.z);
  vec3 transformed = mix(p, curved, uCurvature);

  float d = distance(uv, uPointer);
  float influence = smoothstep(0.42, 0.0, d);
  transformed.z += influence * uHoverStrength;

  // Velocity wave — while the cylinder rotates fast, the TOP edge of the card
  // ripples gently (reference horizontalWaveFollowStrength). Kept subtle.
  float edge = smoothstep(0.55, 1.0, uv.y);
  float wave = sin(uv.x * 4.7 + uTime * 4.0) * uWave * edge;
  transformed.y += wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

/**
 * uScale letterboxes (contain, samples outside → uBg) or crops (cover, <1).
 * uShift is the hover counter-parallax of the texture inside the frame.
 */
export const panelFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uBg;
uniform float uOpacity;
uniform float uBrightness;
uniform vec2 uScale;
uniform vec2 uShift;
uniform vec2 uPointer;
uniform float uGlassEdge;
uniform float uGlassPointer;
varying vec2 vUv;

void main() {
  vec2 uv = 0.5 + (vUv - 0.5) * uScale + uShift;
  vec4 tex = texture2D(uMap, uv);
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec3 color = mix(uBg, tex.rgb, tex.a * inside);

  // Integrated glass: faint highlight along the card edges plus a soft top
  // sheen — the optical "card:glass:edge" from the reference, kept restrained
  // so the photograph stays dominant.
  float edgeD = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float edgeGlow = smoothstep(0.045, 0.0, edgeD) * uGlassEdge * 0.5;
  float topSheen = smoothstep(0.90, 1.0, vUv.y) * uGlassEdge * 0.35;
  // Pointer specular — a soft moving highlight while hovering.
  float pd = distance(vUv, uPointer);
  float pointerGlow = smoothstep(0.34, 0.0, pd) * uGlassPointer;

  color += vec3(1.0) * (edgeGlow + topSheen + pointerGlow);
  gl_FragColor = vec4(color * uBrightness, uOpacity);
}
`;

/**
 * Mirrored reflection: uv flipped vertically, gradient fade from the panel
 * edge, mip-bias blur, brightness up and saturation down per spec.
 */
export const reflectionFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uBg;
uniform float uOpacity;
uniform vec2 uScale;
uniform vec2 uShift;
uniform float uChroma;
varying vec2 vUv;

vec3 sampleMirror(vec2 uv) {
  vec4 tex = texture2D(uMap, uv, 2.5);
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  return mix(uBg, tex.rgb, tex.a * inside);
}

void main() {
  vec2 flipped = vec2(vUv.x, 1.0 - vUv.y);
  vec2 uv = 0.5 + (flipped - 0.5) * uScale + uShift;

  // Prismatic chroma split — stronger toward the bottom of the mirror,
  // echoing the reference's reflect:chroma treatment.
  float ca = uChroma * (1.0 - vUv.y);
  vec2 off = vec2(0.010 * ca, 0.0);
  vec3 color;
  color.r = sampleMirror(uv + off).r;
  color.g = sampleMirror(uv).g;
  color.b = sampleMirror(uv - off).b;

  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(lum), color, 0.7 + 0.5 * ca) * 1.08;

  float fade = smoothstep(0.12, 0.92, vUv.y);
  fade = mix(0.0, 1.0, pow(fade, 1.4));
  gl_FragColor = vec4(color, uOpacity * fade);
}
`;
