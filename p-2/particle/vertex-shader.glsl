uniform float uTime;
uniform vec2 uResolution;
uniform float uProgress;

attribute vec3 aPosition;
attribute vec3 aCenter;
attribute float aIndex;
attribute float aStagger;

// varying vec2 vUv;
varying vec3 vPosition;

vec3 rotateVector(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {
  float halfAngle = angle * 0.5;

  return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

void main(void) {
  float noise = snoise(vec3(aCenter.xy, uTime * 0.00001));
  float noiseX = snoise(vec3(aCenter.xy, uTime * 0.00007));
  float noiseY = snoise(vec3(aCenter.yx, uTime * 0.00005));

  float offset = (step(0.77, snoise(vec3(aStagger, noise, uTime * 0.02))) * 4.0 + 1.0);
  float rad = radians(sin(uTime * 0.005) * 1000.0);
  vec3 axis = vec3(
    aStagger * noiseX,
    aStagger * noiseY,
    aStagger * noise
  );
  vec4 quat = quatFromAxisAngle(axis, rad);

  vec3 orig = (aPosition - aCenter) * offset;


  vec3 transformed = rotateVector(quat, orig) + aCenter;

  vec3 position = vec3(
    transformed.x + noiseX * 500.0,
    transformed.y - noiseY * 200.0,
    transformed.z
  );

  // vUv = uv;
  vPosition = vec3(aCenter);

  // gl_PointSize = 1.0 + ((noise + 1.0) * 0.5) * 10.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
