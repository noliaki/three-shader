uniform float time;
uniform vec2 resolution;
uniform sampler2D uTexture;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);
  return t;
}

void main(void) {
  float noise = snoise(
    vec3(vUv / 1.4, time / 2.0)
  );

  float offset = snoise(vec3(
    vUv + noise * 0.01 * progress,
    time * noise * 0.7 * progress
  ));

  // float offset = rand(vUv);

  // vec4 color = texture2D(
  //   uTexture,
  //   (vUv + noise * 1.5)
  // );

  gl_FragColor = texture2D(uTexture, (vUv + offset * 2.0 * progress));
}
