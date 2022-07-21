uniform float attenuation;
uniform vec2 texResolution;
uniform sampler2D dataTex;

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / texResolution;
  vec4 data = texture2D(dataTex, uv);
  vec2 p = (fc - data.xy) / texResolution;

  gl_FragColor = vec4(
    texture2D(dataTex, p).xy * attenuation,
    data.z,
    0.0
  );
}
