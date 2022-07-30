uniform float attenuation;
uniform vec2 texResolution;
uniform sampler2D dataTex;

const float dt = 0.014;
const float ratio = 0.1;

vec2 bilerp(sampler2D tex, vec2 p, vec2 resolution) {
  vec4 ij; // i0, j0, i1, j1
  ij.xy = floor(p - 0.5) + 0.5;
  ij.zw = ij.xy + 1.0;

  vec4 uv = ij / resolution.xyxy;
  vec2 d11 = sampleV(tex, uv.xy, resolution).xy;
  vec2 d21 = sampleV(tex, uv.zy, resolution).xy;
  vec2 d12 = sampleV(tex, uv.xw, resolution).xy;
  vec2 d22 = sampleV(tex, uv.zw, resolution).xy;

  vec2 a = p - ij.xy;

  return mix(mix(d11, d21, a.x), mix(d12, d22, a.x), a.y);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / texResolution;
  vec4 data = texture2D(dataTex, uv);
  vec2 p = uv - data.xy * dt * ratio;

  // vec2 nv = texture2D(dataTex, p).xy;
  // vec2 ns = p + nv * dt * ratio;

  // vec2 err = ns - uv;

  // vec2 ns2 = ns - err / 2.0;
  // vec2 v2 = texture2D(dataTex, ns2).xy;

  // vec2 os2 = ns2 - v2 * dt * ratio;
  // vec2 nv2 = texture2D(dataTex, os2).xy;
  // vec2 p = (fc - data.xy) / texResolution;

  gl_FragColor = vec4(
    // nv2 * attenuation,
    bilerp(dataTex, fc - sampleV(dataTex, uv, texResolution).xy, texResolution) * attenuation,
    // texture2D(dataTex, p).xy * attenuation,
    data.z,
    0.0
  );
}
