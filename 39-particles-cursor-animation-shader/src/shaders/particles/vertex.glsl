uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uDisplacementTexture;
uniform sampler2D uPictureTexture;

attribute float aAngle;
attribute float aIntensity;

varying vec3 vColor;

void main() {
	// Displacement
	vec3 displacedPosition = position;
	float displacementIntensity = texture2D(uDisplacementTexture, uv).r;
	displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);

	vec3 displacement = vec3(cos(aAngle) * 0.2, sin(aAngle) * 0.2, 1.0);
	displacement = normalize(displacement);
	displacement *= displacementIntensity;
	displacement *= 1.0;
	displacement *= aIntensity;
	displacedPosition += displacement;

	// Wiggle
	float speed = uTime * 2.0;
	vec3 wiggle = vec3(cos(speed - aAngle) * 0.05, sin(speed - aAngle) * 0.05, sin(speed - aAngle) * aIntensity);
	wiggle *= 0.2;
	displacedPosition += wiggle;

	// Final position
	vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;

	// Picture
	float pictureIntensity = texture2D(uPictureTexture, uv).r;

	// Point size
	gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
	gl_PointSize *= (1.0 / -viewPosition.z);

	// Varyings
	vColor = vec3(pow(pictureIntensity, 2.0));
}
