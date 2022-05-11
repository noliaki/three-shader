varying vec2 vUv;

uniform sampler2D uMixBlurTexture;
uniform sampler2D uMixParticleTexture;
uniform sampler2D uFontTexture;
uniform float uTime;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

void main(void) {
  vec2 r = (vec2(rand(vUv.xy), rand(vUv.yx)) * 2.0 - 1.0) * 0.008;
  float noise = snoise(vec3(rand(vUv.xy), rand(vUv.yx), uTime * 0.0003));

  vec4 zanzoColor = texture2D(uMixBlurTexture, vUv + r);
  vec4 fontColor = texture2D(uFontTexture, vUv);
  vec4 pointColor = texture2D(
    uMixParticleTexture,
    vUv
  );

  vec4 resultColor = max(zanzoColor, pointColor);

  if (fontColor.a > 0.0) {
    gl_FragColor = resultColor;
  } else {
    gl_FragColor = vec4(resultColor.rgb * 0.2, 1.0);
  }

  // gl_FragColor = fontColor;
}
