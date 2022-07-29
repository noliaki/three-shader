uniform vec2 texResolution;
uniform sampler2D dataTex;

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec4 data = texture2D(dataTex, fc / texResolution);

  vec2 offsetX = vec2(1.0, 0.0);
  vec2 offsetY = vec2(0.0, 1.0);

  vec2 vLeft = sampleV(dataTex, (fc - offsetX) / texResolution, texResolution).xy;
  vec2 vRight = sampleV(dataTex, (fc + offsetX) / texResolution, texResolution).xy;
  vec2 vTop = sampleV(dataTex, (fc - offsetY) / texResolution, texResolution).xy;
  vec2 vBottom = sampleV(dataTex, (fc + offsetY) / texResolution, texResolution).xy;

  float divergence = ((vRight.x - vLeft.x) + (vBottom.y - vTop.y)) * 0.5;
  gl_FragColor = vec4(data.xyz, divergence);
}
