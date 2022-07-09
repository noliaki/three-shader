precision highp float;

uniform float texPixelRatio;
uniform float alpha;
uniform float beta;
uniform vec2 resolution;
uniform sampler2D dataTex;

void main(){
  vec2 r = resolution * texPixelRatio;
  vec2 coord = gl_FragCoord.xy;
  vec4 data = texture2D(dataTex, coord / r);
  vec2 xShift = vec2(1.0, 0.0);
  vec2 yShift = vec2(0.0, 1.0);

  // 上下左右の圧力
  float pLeft   = samplePressure(dataTex, (coord - xShift) / r, r);
  float pRight  = samplePressure(dataTex, (coord + xShift) / r, r);
  float pTop    = samplePressure(dataTex, (coord - yShift) / r, r);
  float pBottom = samplePressure(dataTex, (coord + yShift) / r, r);

  float divergence = data.w;
  float pressure = (divergence * alpha + (pLeft + pRight + pTop + pBottom)) * 0.25 * beta;
  gl_FragColor = vec4(data.xy, pressure, divergence);
}
