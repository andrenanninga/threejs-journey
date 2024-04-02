attribute float aScale;
attribute vec3 aOffset;

uniform float uSize;
uniform float uTime;

varying vec3 vColor;

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	float angle = atan(modelPosition.x, modelPosition.z);
	float distanceToCenter = length(modelPosition.xz);
	float angleOffset = (1.0 / distanceToCenter) * (uTime + 40.0) * 0.1;

	modelPosition.x = cos(angle + angleOffset) * distanceToCenter;
	modelPosition.z = sin(angle + angleOffset) * distanceToCenter;

	modelPosition.xyz += aOffset;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;

	gl_Position = projectionPosition;

	gl_PointSize = uSize * aScale;
	gl_PointSize *= (1.0 / - viewPosition.z);

	vColor = color;
}
