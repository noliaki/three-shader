vec4 sample(sampler2D tex, vec2 uv, vec2 resolution, bool multiplier) {
  vec2 o = vec2(0.0, 0.0);
  vec2 m = vec2(1.0, 1.0);

  if(uv.x < 0.0) {
    o.x = 1.0;
    m.x = -1.0;
  } else if(uv.x > 1.0) {
    o.x = -1.0;
    m.x = -1.0;
  }

  if(uv.y < 0.0) {
    o.y = 1.0;
    m.y = -1.0;
  } else if(uv.y > 1.0) {
    o.y = -1.0;
    m.y = -1.0;
  }

  vec4 result = texture2D(tex, uv + o / resolution);

  if (multiplier) {
    result.xy *= m;
  }

  return result;
}
