uniform float time;
uniform float devicePixelRatio;
uniform vec2 resolution;
uniform vec2 texResolution;
uniform sampler2D dataTex;

// float random (vec2 st) {
//   return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
// }

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
  vec4 data = texture2D(dataTex, uv);
  vec2 velocity = data.xy;
  float pressure = data.z;
  float vLength = length(velocity);

  vec2 vr = velocity / texResolution;

  float hue = (sin(time * 0.00009) + 1.0) * 0.5;

  vec3 color = hsvToRgb(
    hue + sin((vr.x * vr.x + vr.y * vr.y) + pressure * 0.05),
    0.7 + pressure * 0.05,
    0.5 + (pressure * 0.01) + length(vLength) * 0.5
  );

  gl_FragColor = vec4(
    yiqHueShift(color, (snoise(vec3(vr, time * 0.00009)) + 1.0) * 0.5),
    1.0
  );
}
