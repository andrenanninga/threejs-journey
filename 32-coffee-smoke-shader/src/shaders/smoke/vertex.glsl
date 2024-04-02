uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

#include ../includes/rotate2d.glsl

void main() {
	vec3 smokePosition = position;

	float twistPerlin = texture(
		uPerlinTexture,
		vec2(0.5, uv.y * 0.2 - uTime * 0.04)
	).r;
	float angle = twistPerlin * 10.0;
	smokePosition.xz *= rotate2d(angle);

	vec2 windOffset = vec2(
		texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
		texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
	);
	windOffset *= pow(uv.y, 2.0) * 10.0;

	smokePosition.xz += windOffset;

	vec2 smokeScale = vec2(1.0, 1.0);
	smokeScale *= 0.8 + pow(uv.y, 1.5) * 1.5;

	smokePosition.xz *= smokeScale;

	vec4 modelPosition = modelMatrix * vec4(smokePosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;

	vUv = uv;
}
