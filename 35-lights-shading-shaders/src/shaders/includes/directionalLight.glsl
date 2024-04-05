vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower) {
	vec3 lightDirection = normalize(lightPosition);

	float shading = dot(normal, lightDirection);
	shading = clamp(shading, 0.0, 1.0);

	vec3 lightReflection = reflect(-lightDirection, normal);
	float specular = -dot(lightReflection, viewDirection);
	specular = clamp(specular, 0.0, 1.0);
	specular = pow(specular, specularPower);

	return lightColor * lightIntensity * (shading + specular);
}
