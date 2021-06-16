attribute float index;
attribute vec3 center;
attribute vec3 stagger;

uniform float time;
uniform vec2 resolution;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vIndex;
varying vec3 vStagger;

vec3 rotate3d(vec3 p, float angle, vec3 axis){
  vec3 a = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float r = 1.0 - c;
  mat3 m = mat3(
    a.x * a.x * r + c,
    a.y * a.x * r + a.z * s,
    a.z * a.x * r - a.y * s,
    a.x * a.y * r - a.z * s,
    a.y * a.y * r + c,
    a.z * a.y * r + a.x * s,
    a.x * a.z * r + a.y * s,
    a.y * a.z * r - a.x * s,
    a.z * a.z * r + c
  );
  return m * p;
}

vec3 rotateVector(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {
  float halfAngle = angle * 0.5;

  return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

void main(void) {
  vUv = uv;
  vPosition = position;
  vIndex = index;
  vStagger = stagger;
  float noise = snoise(vec3(stagger.xy, time / 2.0));
  float normalNoise = (noise + 1.0) / 2.0;

  vec2 p = vec2(
    (uv.x * 2.0) - 1.0,
    (uv.y * 2.0) - 1.0
  );


  vec3 axis = stagger * normalNoise;
  float rad = radians(time * 500.0 * pow(normalNoise, 3.0));

  vec4 quat = quatFromAxisAngle(axis, rad);

  vec3 transformed = vec3(position);

  vec3 orig = position - center;

  vec4 pos = mix(
    vec4(position, 1.0),
    vec4(rotateVector(quat, orig) + center + noise * 20.0, 1.0),
    progress
  );

  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
