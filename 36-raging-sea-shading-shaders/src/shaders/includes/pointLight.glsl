vec3 pointLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay) {
	vec3 lightDelta = lightPosition - position;
	float lightDistance = length(lightDelta);
	vec3 lightDirection = normalize(lightDelta);
	vec3 lightReflection = reflect(-lightDirection, normal);

	float shading = dot(normal, lightDirection);
	shading = clamp(shading, 0.0, 1.0);

	float specular = -dot(lightReflection, viewDirection);
	specular = clamp(specular, 0.0, 1.0);
	specular = pow(specular, specularPower);

	float decay = 1.0 - lightDistance * lightDecay;
	decay = clamp(decay, 0.0, 1.0);

	return lightColor * lightIntensity * decay * (shading + specular);
}
