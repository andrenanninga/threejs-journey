uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
	vec3 normal = normalize(vNormal);
	if (!gl_FrontFacing) {
		normal = -normal;
	}

	float stripes = vPosition.y;
	stripes += uTime * 0.05;
	stripes = mod(stripes * 20.0, 1.0);
	stripes = pow(stripes, 3.0);

	vec3 viewDirection = normalize(vPosition - cameraPosition);
	float fresnel = dot(viewDirection, normal) + 1.0;
	fresnel = pow(fresnel, 2.0);

	float falloff = smoothstep(0.8, 0.0, fresnel);

	float holographic = stripes * fresnel;
	holographic += fresnel * 1.25;
	holographic *= falloff;

	gl_FragColor = vec4(uColor, holographic);
	// gl_FragColor = vec4(viewDirection, 1.0);

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
