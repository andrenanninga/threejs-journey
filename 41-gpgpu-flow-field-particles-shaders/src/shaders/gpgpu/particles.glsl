#include ../includes/simplexNoise4d.glsl

uniform sampler2D uBase;
uniform float uTime;
uniform float uDeltaTime;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

void main() {
	float time = uTime * 0.2;

	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 particle = texture2D(uParticles, uv);
	vec4 base = texture2D(uBase, uv);

	// Dead
	if (particle.w >= 1.0) {
		particle.w = mod(particle.w, 1.0);
		particle.xyz = base.xyz;
	} else {
		// Strength
		float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
		float influence = (uFlowFieldInfluence - 0.5) * (-2.0);
		strength = smoothstep(influence, 1.0, strength);

		// Flow field
		vec3 flowField = vec3(0.0);

		flowField.x = simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time));
		flowField.y = simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time));
		flowField.z = simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time));

		flowField = normalize(flowField);

		particle.xyz += flowField * strength * uDeltaTime * uFlowFieldStrength;

		// Decay
		particle.w += uDeltaTime * 0.3;
	}

	gl_FragColor = particle;
}
