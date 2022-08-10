uniform float time;
uniform float viscosity;
uniform float forceRadius;
uniform float forceCoefficient;
uniform float autoforceCoefficient;
uniform sampler2D dataTex;
uniform vec2 pointerPos;
uniform vec2 beforePointerPos;
uniform vec2 texResolution;

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / texResolution;
  vec4 data = texture2D(dataTex, uv);
  vec2 v = data.xy;

  vec2 offsetX = vec2(1.0, 0.0);
  vec2 offsetY = vec2(0.0, 1.0);

  float pLeft = sample(dataTex, (fc - offsetX) / texResolution, texResolution).z;
  float pRight = sample(dataTex, (fc + offsetX) / texResolution, texResolution).z;
  float pTop = sample(dataTex, (fc - offsetY) / texResolution, texResolution).z;
  float pBottom = sample(dataTex, (fc + offsetY) / texResolution, texResolution).z;

  vec2 mPos = vec2(pointerPos.x, texResolution.y - pointerPos.y);
  vec2 mPPos = vec2(beforePointerPos.x, texResolution.y - beforePointerPos.y);
  vec2 mouseV = mPos - mPPos;
  vec2 diff = mPos - fc;
  float len = length(diff) / forceRadius;
  float d = smoothstep(0.0, 1.0, 1.0 - len) * length(mouseV) * 0.99;
  vec2 mforce = d * normalize(diff + mouseV);

  v += vec2(pRight - pLeft, pBottom - pTop) * 0.5;
  v += mforce;
  v *= viscosity;

  gl_FragColor = vec4(v, data.zw);
}
