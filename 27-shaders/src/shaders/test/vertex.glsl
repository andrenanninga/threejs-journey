uniform vec2 uFrequency;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main()
{
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	float elevation = sin(modelPosition.x * uFrequency.x + uTime * -2.0) / 10.0;
	elevation += sin(modelPosition.y * uFrequency.y - uTime) / 10.0;

	modelPosition.z = elevation;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;

	vUv = uv;
	vElevation = elevation;
}
