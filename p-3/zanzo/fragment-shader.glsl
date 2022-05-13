varying vec2 vUv;
uniform sampler2D uZanzoTexture;
uniform sampler2D uZanzoPrevTexture;
uniform float uTime;

void main(void) {
  vec4 prevColor = texture2D(
    uZanzoPrevTexture,
    vUv
  );// - 0.00199;
  float noiseX = snoise(vec3(vUv.x, vUv.y, uTime * 0.00001));
  float noiseY = snoise(vec3(vUv.y, vUv.x, uTime * 0.0001));

  vec4 color = texture2D(uZanzoTexture, vUv);

  vec4 prevMixColor = texture2D(
    uZanzoPrevTexture,
    vec2(
      vUv.x + (noiseX * smoothstep(0.22, 0.88, (noiseX + 1.0) * 0.5) * 0.007),
      vUv.y + (pow(noiseY, 2.0) * -0.02 * cos(uTime * 0.0008))
    )
  );

  gl_FragColor = max(prevMixColor - 0.00199, color);
}
