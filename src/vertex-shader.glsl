uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(void) {
  vUv = uv;
  vPosition = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
