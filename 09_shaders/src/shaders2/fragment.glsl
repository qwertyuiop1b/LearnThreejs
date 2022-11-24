precision mediump float;

varying vec2 vUv;

void main() {

  // gl_FragColor = vec4(vUv, 1.0, 1.0);

  // gl_FragColor = vec4(vUv, 0.0, 1.0);

  // gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0);

  // float strength = vUv.x;
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = vUv.y;
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = 1.0 - vUv.y;
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = 1.0 - vUv.y;
  // gl_FragColor = vec4(vec3(strength * 10.0), 1.0);

  // float strength = mod(vUv.y * 10.0, 1.0);
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = mod(vUv.y * 10.0, 1.0);
  // // 超过edge值为1.0，低于edge值为0.0;
  // strength = step(0.8, strength);
  // // if(strength > 0.5) {
  // //   strength = 1.0;
  // // } else {
  // //   strength = 0.0;
  // // }
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = mod(vUv.x * 10.0, 1.0);
  // strength = step(0.8, strength);
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
  // strength += step(0.5, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.5, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = step(0.5,  mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float barX = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));
  // float strength = barX + barY;
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float barX = step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0 - 0.2, 1.0));
  // float strength = barX + barY;
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = abs(vUv.x - 0.5);
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = abs(vUv.x - 0.5) + abs(vUv.y - 0.5);
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = step(0.2, abs(vUv.x - 0.5));
  // strength += step(0.2, abs(vUv.y - 0.5));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  // gl_FragColor = vec4(vec3(strength), 1.0);

  float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  strength *= 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  gl_FragColor = vec4(vec3(strength), 1.0);



}