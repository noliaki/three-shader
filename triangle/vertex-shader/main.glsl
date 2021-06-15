attribute float index;
attribute vec3 stagger;

uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying float vIndex;
varying vec3 vStagger;

void main(void) {
  vUv = uv;
  vPosition = position;
  vIndex = index;
  vStagger = stagger;

  vec2 p = vec2(
    (uv.x * 2.0) - 1.0,
    (uv.y * 2.0) - 1.0
  );

  float noise = snoise(vec3(position.xy, (time + stagger.z) / 2.0));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy + noise * resolution.xy / 20.0, 0.0, 1.0);
}
