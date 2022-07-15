uniform float texPixelRatio;
uniform vec2 resolution;
uniform sampler2D dataTex;

void main(){
  vec2 r = resolution * texPixelRatio;
  vec2 fc = gl_FragCoord.xy;
  vec4 data = texture2D(dataTex, fc / r);

  vec2 offsetX = vec2(1.0, 0.0);
  vec2 offsetY = vec2(0.0, 1.0);

  // 上下左右の速度
  vec2 vLeft   = sampleVelocity(dataTex, (fc - offsetX) / r, r);
  vec2 vRight  = sampleVelocity(dataTex, (fc + offsetX) / r, r);
  vec2 vTop    = sampleVelocity(dataTex, (fc - offsetY) / r, r);
  vec2 vBottom = sampleVelocity(dataTex, (fc + offsetY) / r, r);

  float divergence = ((vRight.x - vLeft.x) + (vBottom.y - vTop.y)) * 0.5;
  gl_FragColor = vec4(data.xyz, divergence);
}
