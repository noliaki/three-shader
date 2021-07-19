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

vec3 bezier(vec3 A, vec3 B, vec3 C, vec3 D, float t) {
  vec3 E = mix(A, B, t);
  vec3 F = mix(B, C, t);
  vec3 G = mix(C, D, t);

  vec3 H = mix(E, F, t);
  vec3 I = mix(F, G, t);

  vec3 P = mix(H, I, t);

  return P;
}

void main(void) {
  vUv = uv;
  vPosition = position;
  vIndex = index;
  vStagger = stagger;
  vCenter = center;

  float noise = snoise(vec3(stagger.xy * 5.0, time / 5.0));
  float normalNoise = (noise + 1.0) / 2.0;
  float positionNoise = snoise(vec3(center.xy, time / 10.0));
  float positionNoise2 = snoise(vec3(center.zx, time / 10.0));

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


  vec3 orig = position - center;
  vec3 transformed = rotateVector(quat, orig) + center;
  vec3 offset = bezier(
    vec3(
      sin(time / 20.0 * positionNoise) * 5000.0,
      cos(time / 30.0 * positionNoise2) * 5000.0,
      sin(time / 40.0 * positionNoise) * 5000.0
    ),
    vec3(
      cos(time / 50.0 * positionNoise) * 2500.0,
      sin(time / 60.0 * positionNoise2) * 2500.0,
      sin(time / 70.0 * positionNoise) * 2500.0
    ),
    vec3(
      sin(time / 80.0 * positionNoise) * 1500.0,
      sin(time / 90.0 * positionNoise2) * 1500.0,
      cos(time / 10.0 * positionNoise) * 1500.0
    ),
    vec3(
      sin(time / 20.0 * positionNoise) * 200.0,
      sin(time / 25.0 * positionNoise2) * 200.0,
      sin(time / 4.0 * positionNoise) * 200.0
    ),
    tProgress
  );

  vNormal = rotateVector(quat, normal);
  // vNormal = normal;

  vec3 pos = mix(
    position,
    transformed + offset,
    tProgress
  );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
