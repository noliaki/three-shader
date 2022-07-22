uniform float attenuation;
uniform vec2 texResolution;
uniform sampler2D dataTex;

const float dt = 0.014;
const float ratio = 0.1;

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
    texture2D(dataTex, p).xy * attenuation,
    data.z,
    0.0
  );
}
