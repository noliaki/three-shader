uniform float time;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D uTexture;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);
  return t;
}

void main(void) {
  float noise = snoise(
    vec3(vUv, time)
  );

  float offset = rand(vUv);

  vec4 color = texture2D(
    uTexture,
    vUv + offset / 50.0
  );

  gl_FragColor = color;
}
