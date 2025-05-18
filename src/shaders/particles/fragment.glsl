uniform sampler2D uTexture;
uniform float uAlpha;

varying float vColorMix;

void main() {
  float textureAlpha = texture(uTexture, gl_PointCoord).r;

  vec3 c1 = vec3(0.0, 1.0, 0.0);
  vec3 c2 = vec3(0.0, 0.0, 1.0);
  vec3 color = mix(c1, c2, vColorMix);

  gl_FragColor = vec4(color, textureAlpha * uAlpha);
}