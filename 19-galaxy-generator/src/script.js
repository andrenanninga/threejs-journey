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

const parameters = {
	count: 75000,
	particleSize: 0.01,
	radius: 7.5,
	arms: 7,
	curve: Math.PI * 1.75,
	spread: 1.5,
	spreadPower: 1.03,
	insideColor: 0x317f10,
	outsideColor: 0xa63065,
};

gui.add(parameters, 'count').min(5_000).max(100_000).step(100);
gui.add(parameters, 'particleSize').min(0.01).max(1).step(0.01);
gui.add(parameters, 'radius').min(0.05).max(20).step(0.05);
gui.add(parameters, 'arms').min(1).max(10).step(1);
gui.add(parameters, 'spread').min(0).max(5).step(0.1);
gui.add(parameters, 'spreadPower').min(1).max(10).step(0.01);
gui
	.add(parameters, 'curve')
	.min(-Math.PI * 2)
	.max(Math.PI * 2)
	.step(Math.PI * 0.1);

gui.addColor(parameters, 'insideColor');
gui.addColor(parameters, 'outsideColor');

gui.onFinishChange(() => {
	createGalaxy();
});

let geometry = null;
let material = null;
let points = null;

function easeOutQuart(x) {
	return 1 - Math.pow(1 - x, 4);
}

function createGalaxy() {
	geometry?.dispose();
	material?.dispose();

	points?.removeFromParent();

	geometry = new THREE.BufferGeometry();
	material = new THREE.PointsMaterial({
		size: parameters.particleSize,
		sizeAttenuation: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	const positions = new Float32Array(parameters.count * 3);
	const colors = new Float32Array(parameters.count * 3);

	const insideColor = new THREE.Color(parameters.insideColor);
	const outsideColor = new THREE.Color(parameters.outsideColor);
	const baseColor = new THREE.Color();

	for (let i = 0; i < parameters.count; i++) {
		const distance =
			THREE.MathUtils.randFloat(0, parameters.radius) *
			Math.pow(Math.random(), parameters.spreadPower);

		const arm = THREE.MathUtils.randInt(0, parameters.arms);
		const angle = (arm / parameters.arms) * Math.PI * 2;

		const curve = THREE.MathUtils.mapLinear(
			distance,
			0,
			parameters.radius,
			0,
			parameters.curve,
		);

		const spread = Math.pow(Math.random(), parameters.spreadPower);

		const spreadX = THREE.MathUtils.randFloatSpread(parameters.spread * spread);
		const spreadY = THREE.MathUtils.randFloatSpread(parameters.spread * spread);
		const spreadZ = THREE.MathUtils.randFloatSpread(parameters.spread * spread);

		positions[i * 3 + 0] = Math.sin(angle + curve) * distance + spreadX;
		positions[i * 3 + 1] = spreadY;
		positions[i * 3 + 2] = Math.cos(angle + curve) * distance + spreadZ;

		baseColor.copy(insideColor);
		baseColor.lerp(outsideColor, distance / parameters.radius);

		colors[i * 3 + 0] = baseColor.r;
		colors[i * 3 + 1] = baseColor.g;
		colors[i * 3 + 2] = baseColor.b;
	}

	const positionsAttribute = new THREE.BufferAttribute(positions, 3);
	const colorsAttribute = new THREE.BufferAttribute(colors, 3);

	geometry.setAttribute('position', positionsAttribute);
	geometry.setAttribute('color', colorsAttribute);

	points = new THREE.Points(geometry, material);
	scene.add(points);
}

createGalaxy();

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
camera.position.x = 3;
camera.position.y = 3;
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

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
