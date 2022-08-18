uniform float time;
uniform float viscosity;
uniform float forceRadius;
uniform float forceCoefficient;
uniform float autoforceCoefficient;
uniform sampler2D dataTex;
uniform sampler2D textTex;
uniform vec2 pointerPos;
uniform vec2 beforePointerPos;
uniform vec2 texResolution;

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / texResolution;
  vec4 data = texture2D(dataTex, uv);
  vec2 v = data.xy;
  vec4 fontColor = texture2D(textTex, uv);

  vec2 offsetX = vec2(1.0, 0.0);
  vec2 offsetY = vec2(0.0, 1.0);

  float pLeft = sample(dataTex, (fc - offsetX) / texResolution, texResolution).z;
  float pRight = sample(dataTex, (fc + offsetX) / texResolution, texResolution).z;
  float pTop = sample(dataTex, (fc - offsetY) / texResolution, texResolution).z;
  float pBottom = sample(dataTex, (fc + offsetY) / texResolution, texResolution).z;

  float textForce = smoothstep(0.0, 1.0, length(fontColor) * 1.5);

  v += vec2(pRight - pLeft, pBottom - pTop) * 0.5;
  v += textForce;
  v *= viscosity;

  gl_FragColor = vec4(v, data.zw);
}
