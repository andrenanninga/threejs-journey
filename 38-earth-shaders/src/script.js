import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl';

import earthVertexShader from './shaders/earth/vertex.glsl';
import earthFragmentShader from './shaders/earth/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Earth
 */
// Parameters
const earthParameter = {
	atmosphereDayColor: '#00aaff',
	atmosphereTwilightColor: '#ff6600',
};

gui
	.addColor(earthParameter, 'atmosphereDayColor')
	.name('Atmosphere day color')
	.onChange(() => {
		atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
			earthParameter.atmosphereDayColor,
		);

		earthMaterial.uniforms.uAtmosphereDayColor.value.set(
			earthParameter.atmosphereDayColor,
		);
	});

gui
	.addColor(earthParameter, 'atmosphereTwilightColor')
	.name('Atmosphere twilight color')
	.onChange(() => {
		atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
			earthParameter.atmosphereTwilightColor,
		);

		earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(
			earthParameter.atmosphereTwilightColor,
		);
	});

// Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg');
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load('./earth/night.jpg');
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

const earthSpecularCloudsTexture = textureLoader.load(
	'./earth/specularClouds.jpg',
);
earthSpecularCloudsTexture.anisotropy = 8;

// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
	vertexShader: earthVertexShader,
	fragmentShader: earthFragmentShader,
	uniforms: {
		uAtmosphereDayColor: new THREE.Uniform(
			new THREE.Color(earthParameter.atmosphereDayColor),
		),
		uAtmosphereTwilightColor: new THREE.Uniform(
			new THREE.Color(earthParameter.atmosphereTwilightColor),
		),
		uCloudCover: new THREE.Uniform(0.5),
		uDayTexture: new THREE.Uniform(earthDayTexture),
		uNightTexture: new THREE.Uniform(earthNightTexture),
		uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
		uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
	},
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

/**
 * Atmosphere
 */
const atmosphereMaterial = new THREE.ShaderMaterial({
	side: THREE.BackSide,
	transparent: true,
	vertexShader: atmosphereVertexShader,
	fragmentShader: atmosphereFragmentShader,
	uniforms: {
		uAtmosphereDayColor: new THREE.Uniform(
			new THREE.Color(earthParameter.atmosphereDayColor),
		),
		uAtmosphereTwilightColor: new THREE.Uniform(
			new THREE.Color(earthParameter.atmosphereTwilightColor),
		),
		uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
	},
});

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
scene.add(atmosphere);

/**
 * Sun
 */
const sunSpherical = new THREE.Spherical(1, Math.PI / 2, 0.5);
const sunDirection = new THREE.Vector3();

function updateSun() {
	sunDirection.setFromSpherical(sunSpherical);

	debugSun.position.copy(sunDirection).multiplyScalar(5);

	earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
	atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
}

const debugSun = new THREE.Mesh(
	new THREE.IcosahedronGeometry(0.1, 2),
	new THREE.MeshBasicMaterial(),
);

scene.add(debugSun);
updateSun();

gui
	.add(earthMaterial.uniforms.uCloudCover, 'value')
	.min(0)
	.max(1)
	.step(0.01)
	.name('Cloud cover');

gui.add(sunSpherical, 'phi').min(0).max(Math.PI).onChange(updateSun);

gui
	.add(sunSpherical, 'theta')
	.min(0)
	.max(Math.PI * 2)
	.onChange(updateSun);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	25,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
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
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor('#000011');

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	earth.rotation.y = elapsedTime * 0.1;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
