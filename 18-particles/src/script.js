import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const particleTexture = textureLoader.load('/textures/particles/2.png');

/**
 * Particles
 */

// Geometry
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
const particlesGeometry = new THREE.BufferGeometry();

const particleCount = 20000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
	positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(-10);
	positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(-10);
	positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(-10);

	colors[i * 3 + 0] = THREE.MathUtils.randFloat(0, 1);
	colors[i * 3 + 1] = THREE.MathUtils.randFloat(0, 1);
	colors[i * 3 + 2] = THREE.MathUtils.randFloat(0, 1);
}

const positionsAttribute = new THREE.BufferAttribute(positions, 3);
particlesGeometry.setAttribute('position', positionsAttribute);

const colorsAttribute = new THREE.BufferAttribute(colors, 3);
particlesGeometry.setAttribute('color', colorsAttribute);

// Material
const particlesMaterial = new THREE.PointsMaterial();
particlesMaterial.size = 0.1;
particlesMaterial.vertexColors = true;
particlesMaterial.sizeAttenuation = true;
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;
// particlesMaterial.alphaTest = 0.001;
// particlesMaterial.depthTest = false;

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update particles
	// particles.rotation.y = elapsedTime * 0.2;
	for (let i = 0; i < particleCount * 3; i++) {
		const x = particlesGeometry.attributes.position.array[i * 3 + 0];
		const z = particlesGeometry.attributes.position.array[i * 3 + 2];

		particlesGeometry.attributes.position.array[i * 3 + 1] =
			Math.sin(elapsedTime + x) + Math.cos(elapsedTime + z);
	}

	particlesGeometry.attributes.position.needsUpdate = true;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
