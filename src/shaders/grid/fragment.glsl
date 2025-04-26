uniform float uHovered;

varying vec2 vUv;

void main() {
    float borderWidth = 0.04;

    float strength = step(1.0 - borderWidth, mod(vUv.x * 1.0, 1.0));
    strength += step(1.0 - borderWidth, mod(vUv.y * 1.0, 1.0));
    strength += step(mod(vUv.y * 1.0, 1.0), borderWidth);
    strength += step(mod(vUv.x * 1.0, 1.0), borderWidth);
    strength *= uHovered;

    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), strength);
}