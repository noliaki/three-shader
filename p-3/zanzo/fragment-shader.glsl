varying vec2 vUv;
uniform sampler2D uZanzoTexture;
uniform sampler2D uZanzoPrevTexture;
uniform float uTime;

void main(void) {
  float noise = snoise(vec3(vUv, uTime * 0.003));

  vec4 prevColor = texture2D(uZanzoPrevTexture, vUv) - 0.00199;
  vec4 color = texture2D(uZanzoTexture, vUv);

  gl_FragColor = max(prevColor, color);
}
