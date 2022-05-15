varying vec2 vUv;
uniform sampler2D uZanzoTexture;
uniform sampler2D uZanzoPrevTexture;
uniform float uTime;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

void main(void) {
  vec4 prevColor = texture2D(
    uZanzoPrevTexture,
    vUv
  );// - 0.00199;
  float r = (rand(vec2(prevColor.r, prevColor.b)) + 1.0) * 0.5;
  float noiseX = snoise(vec3(vUv.x, vUv.y * r, uTime * 0.00001));
  float noiseY = snoise(vec3(vUv.y * r, vUv.x, uTime * 0.0001));

  vec4 color = texture2D(uZanzoTexture, vUv + (noiseX * 0.01));

  vec4 prevMixColor = texture2D(
    uZanzoPrevTexture,
    vec2(
      vUv.x + (noiseX * 0.01),
      vUv.y + (noiseY * 0.009)
    )
  );

  gl_FragColor = max(prevMixColor - 0.00199, color);
  // gl_FragColor = color;
}
