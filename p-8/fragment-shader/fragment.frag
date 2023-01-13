uniform float time;
uniform float devicePixelRatio;
uniform vec2 resolution;
uniform vec2 texResolution;
uniform vec2 imageResolution;
uniform sampler2D dataTex;
// uniform sampler2D imageTex;

vec2 imageRatio(vec2 resolution, vec2 imageResolution) {
  return vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
}

vec2 imageUv(vec2 resolution, vec2 imageResolution, vec2 uv){
  vec2 ratio = imageRatio(resolution, imageResolution);

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

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

  float YPrime = dot(color, kRGBToYPrime);
  float I = dot(color, kRGBToI);
  float Q = dot(color, kRGBToQ);

  float hue = atan(Q, I);
  float chroma = sqrt(I * I + Q * Q);

  hue += hueAdjust;

  Q = chroma * sin(hue);
  I = chroma * cos(hue);

  vec3 yIQ = vec3(YPrime, I, Q);
  color.r = dot(yIQ, kYIQToR);
  color.g = dot(yIQ, kYIQToG);
  color.b = dot(yIQ, kYIQToB);

  return color;
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy / devicePixelRatio;
  float tTime = time * 0.008;
  float sinTime = sin(tTime * 0.1);
  float timeStep = step(0.78, sinTime);
  float t = timeStep > 0.0 ? floor(tTime + 0.5) : tTime;

  float noise = (snoise(vec3(uv.y, uv.x, t * 0.07) + 1.0)) * 0.5;

  float ratio = 9.0;
  float stepNoise = floor(noise * ratio) / ratio;
  vec3 color = mix(
    yiqHueShift(vec3(0.1, 0.7, 0.9), noise * 0.5),
    yiqHueShift(vec3(0.9, 0.9, 0.1), noise * 0.5),
    stepNoise
  );

  gl_FragColor = vec4(
    color,
    1.0
  );
}
