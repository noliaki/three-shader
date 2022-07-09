precision highp float;

uniform float texPixelRatio;
uniform vec2 resolution;
uniform sampler2D dataTex;

void main(){
  vec2 r = resolution * texPixelRatio;
  vec2 coord = gl_FragCoord.xy;
  vec4 data = texture2D(dataTex, coord / r);

  vec2 offsetX = vec2(1.0, 0.0);
  vec2 offsetY = vec2(0.0, 1.0);

  // 上下左右の速度
  vec2 vLeft   = sampleVelocity(dataTex, (coord - offsetX) / r, r);
  vec2 vRight  = sampleVelocity(dataTex, (coord + offsetX) / r, r);
  vec2 vTop    = sampleVelocity(dataTex, (coord - offsetY) / r, r);
  vec2 vBottom = sampleVelocity(dataTex, (coord + offsetY) / r, r);

  float divergence = ((vRight.x - vLeft.x) + (vBottom.y - vTop.y)) * 0.5;
  gl_FragColor = vec4(data.xy, data.z, divergence);
}
