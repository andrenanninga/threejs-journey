uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

float random2d(vec2 value) {
	return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	float glitchTime = uTime - modelPosition.y;
	float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
	glitchStrength /= 3.0;
	glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
	glitchStrength *= 0.25;

	modelPosition.x += (random2d(modelPosition.xz + uTime) - 0.5) * glitchStrength;
	modelPosition.z += (random2d(modelPosition.zx + uTime) - 0.5) * glitchStrength;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	vec4 modelMatrix = modelMatrix * vec4(normal, 0.0);

	gl_Position = projectedPosition;

	vUv = uv;
	vPosition = modelPosition.xyz;
	vNormal = modelMatrix.xyz;
}
