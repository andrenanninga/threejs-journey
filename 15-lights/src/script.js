import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
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
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.4);
pointLight.position.set(1, 2, -2);
gui.add(pointLight.position, 'x').min(-10).max(10);
gui.add(pointLight.position, 'y').min(-10).max(10);
gui.add(pointLight.position, 'z').min(-10).max(10);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.3);
directionalLight.position.set(5, 2, 4);
gui.add(directionalLight.position, 'x').min(-10).max(10);
gui.add(directionalLight.position, 'y').min(-10).max(10);
gui.add(directionalLight.position, 'z').min(-10).max(10);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
hemisphereLight.position.set(-5, 2, 4);
gui.add(hemisphereLight.position, 'x').min(-10).max(10);
gui.add(hemisphereLight.position, 'y').min(-10).max(10);
gui.add(hemisphereLight.position, 'z').min(-10).max(10);
scene.add(hemisphereLight);

const rectAreaLight = new THREE.RectAreaLight(0x3c00ff, 5, 1, 1);
gui.add(rectAreaLight.position, 'x').min(-10).max(10);
gui.add(rectAreaLight.position, 'y').min(-10).max(10);
gui.add(rectAreaLight.position, 'z').min(-10).max(10);
scene.add(rectAreaLight);

const spotLight = new THREE.SpotLight(
	0x78ff00,
	0.8,
	7,
	Math.PI * 0.1,
	0.3,
	0.1,
);
spotLight.position.set(0, 2, 3);
gui.add(spotLight, 'angle').min(0).max(Math.PI).step(0.01);
gui.add(spotLight.target.position, 'x').min(-10).max(10);
gui.add(spotLight.target.position, 'y').min(-10).max(10);
gui.add(spotLight.target.position, 'z').min(-10).max(10);
scene.add(spotLight);
scene.add(spotLight.target);

// Helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(
	directionalLight,
);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 32, 64),
	material,
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
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

	// Update objects
	sphere.rotation.y = 0.1 * elapsedTime;
	cube.rotation.y = 0.1 * elapsedTime;
	torus.rotation.y = 0.1 * elapsedTime;

	sphere.rotation.x = 0.15 * elapsedTime;
	cube.rotation.x = 0.15 * elapsedTime;
	torus.rotation.x = 0.15 * elapsedTime;

	// rectAreaLight?.lookAt(new THREE.Vector3());

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
