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
varying vec2 vUv;

void main() {
  vec2 uv = 0.5 + (vUv - 0.5) * uScale + uShift;
  vec4 tex = texture2D(uMap, uv);
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec3 color = mix(uBg, tex.rgb, tex.a * inside);
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
varying vec2 vUv;

void main() {
  vec2 flipped = vec2(vUv.x, 1.0 - vUv.y);
  vec2 uv = 0.5 + (flipped - 0.5) * uScale + uShift;
  vec4 tex = texture2D(uMap, uv, 2.5);
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec3 color = mix(uBg, tex.rgb, tex.a * inside);

  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(lum), color, 0.7) * 1.08;

  float fade = smoothstep(0.12, 0.92, vUv.y);
  fade = mix(0.0, 1.0, pow(fade, 1.4));
  gl_FragColor = vec4(color, uOpacity * fade);
}
`;
