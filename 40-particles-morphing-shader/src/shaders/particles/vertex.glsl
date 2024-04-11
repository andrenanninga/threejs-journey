attribute vec3 aPreviousPosition;
attribute float aSize;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uProgress;
uniform vec2 uResolution;
uniform float uSize;

varying vec3 vColor;

#include ../includes/simplexNoise3d.glsl

void main() {
	// Mixed position
	float noiseFinal = simplexNoise3d(position * 0.2);
	float noisePrevious = simplexNoise3d(aPreviousPosition * 0.2);
	float noise = mix(noisePrevious, noiseFinal, uProgress);
	noise = smoothstep(-1.0, 1.0, noise);

	float duration = 0.4;
	float delay = noise * (1.0 - duration);
	float end = delay + duration;

	float progress = smoothstep(delay, end, uProgress);

	vec3 mixedPosition = mix(aPreviousPosition, position, progress);

	// Final position
	vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;

	// Point size
	gl_PointSize = uSize * aSize * uResolution.y;
	gl_PointSize *= (1.0 / -viewPosition.z);

	vColor = mix(uColorA, uColorB, noise);
}
