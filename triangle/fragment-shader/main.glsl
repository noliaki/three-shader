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
    vec3(vUv / 1.4, time / (4.0 - (progress * 2.0)))
  );

  // float offset = rand(vUv);

  // vec4 color = texture2D(
  //   uTexture,
  //   (vUv + noise * 1.5)
  // );

  gl_FragColor = vec4(0.0, 0.5, 0.9, 1.0);//texture2D(uTexture, (vUv + noise * 2.0 * progress));
}
