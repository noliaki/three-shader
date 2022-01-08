varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uPrevTexture;
// uniform float uProgress;

// float rand(vec2 co) {
//   float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
//   float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
//   float t = fract(s * 43758.5453);

//   return t;
// }

void main(void) {
  vec4 prevColor = texture2D(uPrevTexture, vUv) - 0.006;
  vec4 color = texture2D(uTexture, vUv);

  gl_FragColor = max(prevColor, color);
}
