uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(void) {
  float noise = snoise(vec3(vUv, time));

  gl_FragColor = vec4(
    (snoise(vec3(vUv * 2.0, time / 2.0)) + 1.0) / 2.0,
    (snoise(vec3(vUv / 2.0, time / 3.0)) + 1.0) / 2.0,
    (snoise(vec3(vUv, time / 4.0)) + 1.0) / 2.0,
    1.0
  );
}
