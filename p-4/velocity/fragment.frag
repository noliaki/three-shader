uniform float time;
uniform float texPixelRatio;
uniform float viscosity;
uniform float forceRadius;
uniform float forceCoefficient;
uniform float autoforceCoefficient;
uniform vec2 resolution;
uniform sampler2D dataTex;
uniform vec2 pointerPos;
uniform vec2 beforePointerPos;

void main(){
  vec2 r = resolution * texPixelRatio;
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / r;
  vec4 data = texture2D(dataTex, uv);
  vec2 v = data.xy;

  vec2 offsetX = vec2(1.0, 0.0);
  vec2 offsetY = vec2(0.0, 1.0);

  // 上下左右の圧力
  float pLeft   = samplePressure(dataTex, (fc - offsetX) / r, r);
  float pRight  = samplePressure(dataTex, (fc + offsetX) / r, r);
  float pTop    = samplePressure(dataTex, (fc - offsetY) / r, r);
  float pBottom = samplePressure(dataTex, (fc + offsetY) / r, r);

  // マウス
  vec2 mPos = vec2(pointerPos.x * texPixelRatio, r.y - pointerPos.y * texPixelRatio);
  vec2 mPPos = vec2(beforePointerPos.x * texPixelRatio, r.y - beforePointerPos.y * texPixelRatio);
  vec2 mouseV = mPos - mPPos;
  float len = length(mPos - uv * r) / forceRadius / texPixelRatio;
  float d = clamp(1.0 - len, 0.0, 1.0) * length(mouseV) * forceCoefficient;
  vec2 mforce = d * normalize(mPos - uv * r + mouseV);

  // 自動
  float noiseX = snoise(vec2(uv.s, time / 5000.0 + uv.t));
  float noiseY = snoise(vec2(time / 5000.0 + uv.s, uv.t));
  float waveX = cos(time / 1000.0 + noiseX) * sin(time / 400.0 + noiseX) * cos(time / 600.0 + noiseX);
  float waveY = sin(time / 500.0 + noiseY) * cos(time / 800.0 + noiseY) * sin(time / 400.0 + noiseY);
  waveX = map(waveX, -1.0, 1.0, -0.2, 1.2, true);
  waveY = map(waveY, -1.0, 1.0, -0.2, 1.2, true);
  vec2 aPos = vec2(
    r.x * waveX,
    r.y * waveY
  );
  len = length(aPos - uv * r) / forceRadius / texPixelRatio / 5.0;
  d = clamp(1.0 - len, 0.0, 1.0) * autoforceCoefficient;
  vec2 aforce = d * normalize(aPos - uv * r);

  v += vec2(pRight - pLeft, pBottom - pTop) * 0.5;
  v += mforce + aforce;
  v *= viscosity;
  gl_FragColor = vec4(v, data.zw);
}
