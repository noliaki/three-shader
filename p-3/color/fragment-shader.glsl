varying vec2 vUv;
uniform sampler2D uFontTexture;
uniform float uTime;

vec3 hsvToRgb(float h, float s, float v){
  vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));

  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void) {
  float rounded = 7.5;
  vec4 fontColor = texture2D(uFontTexture, vUv);
  float noise = (snoise(vec3(vUv, uTime * 0.001)) + 1.0) * 0.5;
  vec3 color = hsvToRgb(
    (floor(noise * rounded) / rounded),
    0.7,
    0.9
  );

  if (fontColor.a == 0.0) {
    discard;
  } else {
    gl_FragColor = vec4(color, 1.0);
  }
  // gl_FragColor = vec4(color, 1.0);
  // gl_FragColor = vec4(color, smoothstep(0.0, 1.0, fontColor.a));
}
