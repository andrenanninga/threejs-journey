import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { Sky } from 'three-stdlib';

import fireworkVertexShader from './shaders/firework/vertex.glsl';
import fireworkFragmentShader from './shaders/firework/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Screen
 */
const screen = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(window.devicePixelRatio, 2),
	resolution: new THREE.Vector2(),
};

screen.resolution.set(
	screen.width * screen.pixelRatio,
	screen.height * screen.pixelRatio,
);

window.addEventListener('resize', () => {
	// Update screen
	screen.width = window.innerWidth;
	screen.height = window.innerHeight;
	screen.pixelRatio = Math.min(window.devicePixelRatio, 2);

	screen.resolution.set(
		screen.width * screen.pixelRatio,
		screen.height * screen.pixelRatio,
	);

	// Update camera
	camera.aspect = screen.width / screen.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(screen.width, screen.height);
	renderer.setPixelRatio(screen.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	25,
	screen.width / screen.height,
	0.1,
	100,
);
camera.position.set(1.5, 0, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(screen.width, screen.height);
renderer.setPixelRatio(screen.pixelRatio);

/**
 * Fireworks
 */
const textures = [
	textureLoader.load('/particles/1.png'),
	textureLoader.load('/particles/2.png'),
	textureLoader.load('/particles/3.png'),
	textureLoader.load('/particles/4.png'),
	textureLoader.load('/particles/5.png'),
	textureLoader.load('/particles/6.png'),
	textureLoader.load('/particles/7.png'),
	textureLoader.load('/particles/8.png'),
];

function createFirework(count, position, size, texture, radius, color) {
	const geometry = new THREE.BufferGeometry();

	const positions = new Float32Array(count * 3);
	const sizes = new Float32Array(count);
	const timeMultipliers = new Float32Array(count);

	const point = new THREE.Vector3();

	for (let i = 0; i < count; i++) {
		const i3 = i * 3;

		point.setFromSphericalCoords(
			radius + THREE.MathUtils.randFloatSpread(radius * 0.25),
			Math.random() * Math.PI,
			Math.random() * Math.PI * 2,
		);

		positions[i3 + 0] = point.x;
		positions[i3 + 1] = point.y;
		positions[i3 + 2] = point.z;

		sizes[i] = Math.random();
		timeMultipliers[i] = 1 + Math.random();
	}

	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(positions, 3),
	);

	geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
	geometry.setAttribute(
		'aTimeMultiplier',
		new THREE.Float32BufferAttribute(timeMultipliers, 1),
	);

	texture.flipY = false;
	const material = new THREE.ShaderMaterial({
		vertexShader: fireworkVertexShader,
		fragmentShader: fireworkFragmentShader,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		uniforms: {
			uColor: new THREE.Uniform(color),
			uProgress: new THREE.Uniform(0),
			uResolution: new THREE.Uniform(screen.resolution),
			uSize: new THREE.Uniform(size),
			uTexture: new THREE.Uniform(texture),
		},
		transparent: true,
	});

	const firework = new THREE.Points(geometry, material);
	firework.position.copy(position);
	scene.add(firework);

	function dispose() {
		scene.remove(firework);
		geometry.dispose();
		material.dispose();
	}

	gsap.to(material.uniforms.uProgress, {
		value: 1,
		duration: 3,
		ease: 'linear',
		onComplete: dispose,
	});
}

function createRandomFirework() {
	const count = THREE.MathUtils.randInt(400, 1000);
	const position = new THREE.Vector3(
		THREE.MathUtils.randFloatSpread(5),
		THREE.MathUtils.randFloatSpread(3),
		THREE.MathUtils.randFloatSpread(5),
	);
	const size = THREE.MathUtils.randFloat(0.1, 0.2);
	const texture = textures[Math.floor(Math.random() * textures.length)];
	const radius = THREE.MathUtils.randFloat(0.5, 1.5);
	const color = new THREE.Color();
	color.setHSL(Math.random(), 1, 0.7);

	createFirework(count, position, size, texture, radius, color);
}

createRandomFirework();
window.addEventListener('click', () => {
	createRandomFirework();
});

/**
 * Sky
 */
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();

/// GUI

const skyParameters = {
	turbidity: 10,
	rayleigh: 3,
	mieCoefficient: 0.005,
	mieDirectionalG: 0.95,
	elevation: -2.2,
	azimuth: 180,
	exposure: renderer.toneMappingExposure,
};

function updateSky() {
	const uniforms = sky.material.uniforms;
	uniforms['turbidity'].value = skyParameters.turbidity;
	uniforms['rayleigh'].value = skyParameters.rayleigh;
	uniforms['mieCoefficient'].value = skyParameters.mieCoefficient;
	uniforms['mieDirectionalG'].value = skyParameters.mieDirectionalG;

	const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
	const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);

	sun.setFromSphericalCoords(1, phi, theta);

	uniforms['sunPosition'].value.copy(sun);

	renderer.toneMappingExposure = skyParameters.exposure;
	renderer.render(scene, camera);
}

gui.add(skyParameters, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSky);
gui.add(skyParameters, 'rayleigh', 0.0, 4, 0.001).onChange(updateSky);
gui.add(skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSky);
gui.add(skyParameters, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSky);
gui.add(skyParameters, 'elevation', -3, 10, 0.1).onChange(updateSky);
gui.add(skyParameters, 'azimuth', -180, 180, 0.1).onChange(updateSky);
gui.add(skyParameters, 'exposure', 0, 1, 0.0001).onChange(updateSky);

updateSky();
/**
 * Animate
 */
const tick = () => {
	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
