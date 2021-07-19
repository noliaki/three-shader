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
varying vec3 vCenter;
varying vec3 vNormal;
varying float vDiff;

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
  vCenter = center;

  float noise = snoise(vec3(stagger.xy * 5.0, time / 30.0));
  float normalNoise = (noise + 1.0) / 2.0;

  float delay = (
    ((position.x / (resolution.x * 0.5)) + 1.0) * 0.5 +
    ((position.y / (resolution.y * 0.5)) + 1.0) * 0.5
  ) * 0.5 * 0.5;

  float duration = 0.5;

  float tProgress = clamp(progress - delay, 0.0, duration) / duration;

  vec2 p = vec2(
    (uv.x * 2.0) - 1.0,
    (uv.y * 2.0) - 1.0
  );

  vec3 axis = normalNoise * stagger * 1.2;
  float rad = radians(360.0 * tProgress * noise * -1.0 + noise * 3600.0 * tProgress);

  vec4 quat = quatFromAxisAngle(axis, rad);

  vec3 transformed = vec3(position);

  vec3 offset = vec3(center.x + noise * 30.0, center.y + noise * 30.0, 0.0);
  vec3 orig = position - offset;

  vNormal = rotateVector(quat, normal);
  // vNormal = normal;

  vec4 pos = mix(
    vec4(position, 1.0),
    vec4(rotateVector(quat, orig) + offset, 1.0),
    progress
  );

  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
