uniform float time;
uniform vec2 resolution;
uniform sampler2D uTexture;
uniform float progress;

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

void main(void) {
  vec2 uv = vec2(resolution.xy / gl_FragCoord.xy);
  vec4 hsvColor = vec4(hsvToRgb((uv.x + uv.y) / 2.0, 0.8, 0.9), 1.0);

  gl_FragColor = mix(texture2D(uTexture, uv), hsvColor, progress);
}
