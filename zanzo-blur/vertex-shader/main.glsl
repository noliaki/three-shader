uniform float uTime;

// varying vec2 vUv;
varying vec3 vPosition;

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
  float noise = snoise(vec3(position.xy, uTime * 0.0001));
  float noiseX = snoise(vec3(position.xy, uTime * 0.0007));
  float noiseY = snoise(vec3(position.yx, uTime * 0.0005));

  vec3 pos = vec3(
    position.x + noiseX * (100.0 + noise * 100.0),
    position.y + noiseY * (100.0 + noise * 100.0),
    0.0
  );

  gl_PointSize = 1.0 + ((noise + 1.0) * 0.5) * 50.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  // vUv = uv;
  vPosition = position;
}
