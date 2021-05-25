uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(void) {
  gl_FragColor = vec4(
    pow(sin(time + vUv.x * 10.0), 2.0),
    pow(sin(time + vUv.y * 10.0), 4.0),
    pow(sin(time), 6.0),
    1.0
  );
}
