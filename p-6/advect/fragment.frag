uniform float attenuation;
uniform vec2 texResolution;
uniform sampler2D dataTex;

const float dt = 0.014;
const float ratio = 0.1;
const float diff = 0.5;

float random (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 lerp(sampler2D tex, vec2 p, vec2 resolution) {
  vec4 ij;
  ij.xy = floor(p - diff) + diff;
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
  float r = random(uv) * 2.0 - 1.0;
  vec4 data = texture2D(dataTex, uv);
  vec2 p = uv - data.xy * dt * ratio;

  gl_FragColor = vec4(
    lerp(dataTex, fc - sampleV(dataTex, uv, texResolution).xy, texResolution) * attenuation + r * 0.05,
    data.z,
    0.0
  );
}
