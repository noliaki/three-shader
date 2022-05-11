varying vec2 vUv;
uniform sampler2D uDisplayTexture;
uniform float uTime;

void main(void) {
  // vec4 color = texture2D(uDisplayTexture, vUv);
  float noise = snoise(vec3(vUv.x, vUv.y, uTime * 0.0003));
  // vec2 uv = vec2(vUv.x * color.a * noise * 0.1, vUv.y * color.a * noise * 0.1);

  gl_FragColor = texture2D(uDisplayTexture, vUv + noise * 0.00001);
}
