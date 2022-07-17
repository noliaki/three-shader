uniform float time;
uniform float devicePixelRatio;
uniform vec2 resolution;
uniform sampler2D dataTex;

const float h1 = 0.1;
const float h2 = 0.3;
const float s1 = 0.7;
const float s2 = 0.8;
const float v1 = 0.8;
const float v2 = 0.9;

vec3 hsvToRgb(float h, float s, float v){
  vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));

  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}


void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy / devicePixelRatio;
  vec4 data = texture2D(dataTex, uv);
  vec2 velocity = data.xy;
  float pressure = data.z;
  float vLength = length(velocity);

  vec2 v = (velocity + 1.0) * 0.5;
  vec3 color = mix(vec3(1.0), vec3(v, 1.0), vLength);

  // gl_FragColor = vec4(
  //   vLength,
  //   0.0,
  //   0.0,
  //   1.0
  // );

  float y = 0.65;
  float i = smoothstep(-5.0, 5.0, vLength) * -2.0 + 1.0 + (sin(time * 0.0004) + 1.0) * 0.5;
  float q = smoothstep(-5.0, 5.0, pressure) * -2.0 + 1.0 + (sin(time * 0.0002) + 1.0) * 0.5;

  gl_FragColor = vec4(
    y + 0.956 * i + 0.621 * q,
    y - 0.272 * i - 0.647 * q,
    y - 1.105 * i + 0.702 * q,
    1.0
  );
  // gl_FragColor = vec4(
  //   hsvToRgb(
  //     map(vLength * 0.3, 0.0, 1.0, h1, h2, true) + time * 0.00006,
  //     map(pressure * 0.3, 0.0, 1.0, s1, s2, true),
  //     map(1.0 - vLength * pressure * 0.1, 0.0, 1.0, v1, v2, true)
  //   ),
  //   1.0
  // );
}
