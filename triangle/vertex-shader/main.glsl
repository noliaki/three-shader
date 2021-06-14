uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(void) {
  vUv = uv;
  vPosition = position;

  vec2 p = vec2(
    (uv.x * 2.0) - 1.0,
    (uv.y * 2.0) - 1.0
  );

  float noise = (snoise(vec3(position.x / resolution.x, position.y / resolution.y,  time)) + 1.0) / 2.0;
  vec4 pos = vec4(position.xy + noise * 100.0, 0.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, 0.0, 1.0);
}
