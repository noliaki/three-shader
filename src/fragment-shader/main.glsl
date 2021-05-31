uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D tex;

float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}


void main(void) {
  float noise = snoise(vec3(vUv, time / 3.0));

  vec4 color = texture2D(tex, vUv + (rand(vUv * noise / 100.0) / 60.0) + noise / 10.0);

  gl_FragColor = color;
}
