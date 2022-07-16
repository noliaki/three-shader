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

// vec3 hsvToRgb(float h, float s, float v){
//   vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
//   vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));

//   return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
// }

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
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

  // float y = map(vLength * 0.3, 0.0, 1.0, h1, h2, true) + (sin(time * 0.00002) + 1.0) * 0.5;
  // float i = map(pressure * 0.3, 0.0, 1.0, s1, s2, true) + (sin(time * 0.00004) + 1.0) * 0.5;
  // float q = map(1.0 - vLength * pressure * 0.1, 0.0, 1.0, v1, v2, true) + (sin(time * 0.00006) + 1.0) * 0.5;

  // gl_FragColor = vec4(
  //   y + 0.956 * i + 0.621 * q,
  //   y - 0.272 * i - 0.647 * q,
  //   y - 1.105 * i + 0.702 * q,
  //   1.0
  // );
  gl_FragColor = vec4(
    hsv2rgb(vec3(
      map(vLength * 0.3, 0.0, 1.0, h1, h2, true) + time * 0.00006,
      map(pressure * 0.3, 0.0, 1.0, s1, s2, true),
      map(1.0 - vLength * pressure * 0.1, 0.0, 1.0, v1, v2, true)
    )),
    1.0
  );
}
