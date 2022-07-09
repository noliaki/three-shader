precision highp float;

uniform float texPixelRatio;
uniform float attenuation;
uniform vec2 resolution;
uniform sampler2D dataTex;

vec2 bilerp(sampler2D tex, vec2 p, vec2 resolution) {
  vec4 ij; // i0, j0, i1, j1
  ij.xy = floor(p - 0.5) + 0.5;
  ij.zw = ij.xy + 1.0;

  vec4 uv = ij / resolution.xyxy;
  vec2 d11 = sampleVelocity(tex, uv.xy, resolution);
  vec2 d21 = sampleVelocity(tex, uv.zy, resolution);
  vec2 d12 = sampleVelocity(tex, uv.xw, resolution);
  vec2 d22 = sampleVelocity(tex, uv.zw, resolution);

  vec2 a = p - ij.xy;

  return mix(mix(d11, d21, a.x), mix(d12, d22, a.x), a.y);
}

void main() {
  vec2 r = resolution * texPixelRatio;
  vec2 fc = gl_FragCoord.xy;
  vec2 p = fc - sampleVelocity(dataTex, fc / r, r);

  gl_FragColor = vec4(
    bilerp(dataTex, p, r) * attenuation,
    samplePressure(dataTex, fc / r, r),
    0.0
  );
}
