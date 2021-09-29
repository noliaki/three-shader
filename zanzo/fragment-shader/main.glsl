uniform float uTime;

varying vec3 vPosition;

vec3 hsvToRgb(float h, float s, float v){
  vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));

  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void) {
  vec2 n = gl_PointCoord * 2.0 - 1.0;

  if (1.0 - dot(n.xy, n.xy) < 0.0) {
    discard;
  }

  vec3 color = hsvToRgb(
    (snoise(vec3(vPosition.xy, uTime * 0.0001)) + 1.0) * 0.5,
    0.5,
    0.7
  );

  gl_FragColor = vec4(color, 1.0);
}
