uniform vec2 texResolution;
uniform float alpha;
uniform float beta;
uniform sampler2D dataTex;

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec4 data = texture2D(dataTex, fc / texResolution);
  vec2 xShift = vec2(1.0, 0.0);
  vec2 yShift = vec2(0.0, 1.0);

  float pLeft = sample(dataTex, (fc - xShift) / texResolution, texResolution).z;
  float pRight = sample(dataTex, (fc + xShift) / texResolution, texResolution).z;
  float pTop = sample(dataTex, (fc - yShift) / texResolution, texResolution).z;
  float pBottom = sample(dataTex, (fc + yShift) / texResolution, texResolution).z;

  float divergence = data.w;
  float pressure = (divergence * alpha + (pLeft + pRight + pTop + pBottom)) * 0.25 * beta;

  gl_FragColor = vec4(data.xy, pressure, divergence);
}
