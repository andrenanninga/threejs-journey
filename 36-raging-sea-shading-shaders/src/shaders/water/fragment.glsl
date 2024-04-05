#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
	vec3 viewDirection = normalize(vPosition - cameraPosition);
	vec3 normal = normalize(vNormal);

	// Base color
	float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
	mixStrength = smoothstep(0.0, 1.0, mixStrength);
	vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

	// Light
	vec3 light = vec3(0.0);
	light += ambientLight(vec3(1.0), 0.5);
	light += pointLight(vec3(1.0), 5.0, normal, vec3(0.0, 0.25, 0.0), viewDirection, 3.0, vPosition, 0.95);
	color *= light;

	color += uDepthColor * 0.05 * (1.0 - (vElevation + uColorOffset));

	// Final color
	gl_FragColor = vec4(color, 1.0);

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
