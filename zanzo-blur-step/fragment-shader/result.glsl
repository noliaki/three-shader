varying vec2 vUv;

uniform sampler2D uZanzoTexture;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

void main(void) {
  vec2 r = vec2(rand(vUv.xy), rand(vUv.yx)) * 2.0 - 1.0;

  gl_FragColor = texture2D(uZanzoTexture, vUv + r * 0.004);
}
