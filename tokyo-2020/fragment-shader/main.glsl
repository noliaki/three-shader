uniform float time;
uniform vec2 resolution;
uniform sampler2D uTexture;
uniform float progress;
uniform vec2 uTextureResolution;

varying vec2 vUv;
varying vec3 vPosition;
varying float vIndex;
varying vec3 vCenter;
varying float vDiff;
varying vec3 vNormal;
varying float vProgress;

vec3 hsvToRgb(float h, float s, float v){
  vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));

  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

vec2 imageRatio(vec2 resolution, vec2 imageResolution) {
  return vec2(
    max((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    max((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
}

vec2 imageUv(vec2 resolution, vec2 imageResolution, vec2 uv){
  vec2 ratio = imageRatio(resolution, imageResolution);

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

const float ls = 1.8;

void main(void) {
  vec2 uv = imageUv(resolution, uTextureResolution, vUv);
  float noise = snoise(vec3(vCenter.xy, time / 10.0));
  float pnoise = snoise(vec3(vUv, time / 5.0));
  float light = abs(dot(vNormal, vec3(0.0, 0.0, 1.0))) * ls;

  vec2 p = vec2(
    ((vPosition.x + (resolution.x / 2.0)) / 2.0) / resolution.x,
    ((vPosition.y + (resolution.y / 2.0)) / 2.0) / resolution.y
  );

  vec4 texColor = texture2D(uTexture, uv);
  vec4 hsvColor = vec4(
    hsvToRgb(
      (sin(time) + 1.0 + noise * 0.5 + pnoise * 0.5) / 2.0,
      0.5,
      0.8
    ) * light,
    1.0
  );


  gl_FragColor = mix(hsvColor, hsvColor * texColor.a, vProgress);
}
