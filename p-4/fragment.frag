uniform float time;
uniform float devicePixelRatio;
uniform float texPixelRatio;
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

vec3 yiqHueShift(vec3 color, float hueAdjust) {
  const vec3 kRGBToYPrime = vec3(0.299, 0.587, 0.114);
  const vec3 kRGBToI = vec3(0.596, -0.275, -0.321);
  const vec3 kRGBToQ = vec3(0.212, -0.523, 0.311);

  const vec3 kYIQToR = vec3(1.0, 0.956, 0.621);
  const vec3 kYIQToG = vec3(1.0, -0.272, -0.647);
  const vec3 kYIQToB = vec3(1.0, -1.107, 1.704);

  // Convert to YIQ
  float YPrime = dot(color, kRGBToYPrime);
  float I = dot(color, kRGBToI);
  float Q = dot(color, kRGBToQ);

  // Calculate the hue and chroma
  float hue = atan(Q, I);
  float chroma = sqrt(I * I + Q * Q);

  // Make the user's adjustments
  hue += hueAdjust;

  // Convert back to YIQ
  Q = chroma * sin(hue);
  I = chroma * cos(hue);

  // Convert back to RGB
  vec3 yIQ = vec3(YPrime, I, Q);
  color.r = dot(yIQ, kYIQToR);
  color.g = dot(yIQ, kYIQToG);
  color.b = dot(yIQ, kYIQToB);

  return color;
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy / devicePixelRatio;
  vec2 texR = resolution * texPixelRatio;
  vec4 data = texture2D(dataTex, uv);
  vec2 velocity = data.xy;
  float pressure = data.z;
  float vLength = length(velocity);

  vec2 vr = velocity;

  // vec2 v = (velocity + 1.0) * 0.5;
  // vec3 color = mix(vec3(1.0), vec3(v, 1.0), vLength);
  vec3 color = hsvToRgb(
    smoothstep(-0.8, 0.8, sin(time * 0.00006 + pressure * 0.1)),
    0.7 + pressure * 0.3,
    0.7
  );

  gl_FragColor = vec4(
    yiqHueShift(
      color,
      smoothstep(-0.8, 0.8, (vr.x + vr.y) * 0.5 + sin(time * 0.00002))
    ),
    1.0
  );

  // gl_FragColor = vec4(
  //   vLength,
  //   0.0,
  //   0.0,
  //   1.0
  // );

  // float y = 0.65;
  // float i = smoothstep(-5.0, 5.0, vLength) * -2.0 + 1.0 + (sin(time * 0.0004) + 1.0) * 0.5;
  // float q = smoothstep(-5.0, 5.0, pressure) * -2.0 + 1.0 + (sin(time * 0.0002) + 1.0) * 0.5;

  // gl_FragColor = vec4(
  //   y + 0.956 * i + 0.621 * q,
  //   y - 0.272 * i - 0.647 * q,
  //   y - 1.105 * i + 0.702 * q,
  //   1.0
  // );
  // gl_FragColor = vec4(
  //   hsvToRgb(
  //     map(vLength * 0.3, 0.0, 1.0, h1, h2, true) + time * 0.00006,
  //     map(pressure * 0.3, 0.0, 1.0, s1, s2, true),
  //     map(1.0 - vLength * pressure * 0.1, 0.0, 1.0, v1, v2, true)
  //   ),
  //   1.0
  // );
}
