uniform bool uIsHorizontal;
uniform sampler2D uBlurTexture;
uniform float uWeight[100];
uniform vec2 uResolution;
uniform int uBlurTimes;

void main(void) {
  vec2 tFrag = 1.0 / uResolution;
  vec2 fc = gl_FragCoord.xy;
  vec4 texColor = texture2D(uBlurTexture, fc * tFrag);
  vec3 destColor = texColor.rgb * uWeight[0];

  for (int i = 1; i < uBlurTimes; i++) {
    vec2 dfc = uIsHorizontal ? vec2(float(i), 0.0) : vec2(0.0, float(i));

    destColor += texture2D(uBlurTexture, (fc + dfc) * tFrag).rgb * uWeight[i];
    destColor += texture2D(uBlurTexture, (fc + dfc * -1.0) * tFrag).rgb * uWeight[i];
  }

  gl_FragColor = vec4(destColor, texColor.a);
}
