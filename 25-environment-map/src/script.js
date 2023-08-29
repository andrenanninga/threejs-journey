import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GroundProjectedSkybox } from 'three/examples/jsm/objects/GroundProjectedSkybox';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const tweaks = {
	envMapIntensity: 1,
};

gui
	.add(tweaks, 'envMapIntensity')
	.min(0)
	.max(10)
	.onChange(() => {
		updateAllMaterials();
	});

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;

/**
 * Environment
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();

// LDR Cube
// const environmentMap = cubeTextureLoader.load([
// 	'/environmentMaps/0/px.png',
// 	'/environmentMaps/0/nx.png',
// 	'/environmentMaps/0/py.png',
// 	'/environmentMaps/0/ny.png',
// 	'/environmentMaps/0/pz.png',
// 	'/environmentMaps/0/nz.png',
// ]);

// scene.background = environmentMap;
// scene.environment = environmentMap;

// HDR Equirectangular
// rgbeLoader.load('/environmentMaps/blender-2k.hdr', (environmentMap) => {
// 	environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// 	scene.background = environmentMap;
// 	scene.environment = environmentMap;
// });

// LDR Equirectangular
// const environmentMap = textureLoader.load(
// 	'/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg',
// );
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// environmentMap.colorSpace = THREE.SRGBColorSpace;
// scene.background = environmentMap;
// scene.environment = environmentMap;
// scene.backgroundBlurriness = 0.05;
// tweaks.envMapIntensity = 2.25;

// Ground Projected Skybox
// rgbeLoader.load('/environmentMaps/2/2k.hdr', (environmentMap) => {
// 	environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// 	scene.environment = environmentMap;

// 	const skybox = new GroundProjectedSkybox(environmentMap);
// 	skybox.scale.setScalar(50);
// 	scene.add(skybox);

// 	gui.add(skybox, 'radius').min(1).max(200).step(0.1);
// 	gui.add(skybox, 'height').min(1).max(200).step(0.1);
// });

/**
 * Real time environment map
 */
const environmentMap = textureLoader.load(
	'/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg',
);
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;
scene.background = environmentMap;

// Holy donut
const holyDonut = new THREE.Mesh(
	new THREE.TorusGeometry(8, 0.5),
	new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) }),
);

holyDonut.layers.enable(0);
holyDonut.layers.enable(1);
holyDonut.position.y = 3.5;
scene.add(holyDonut);

// Cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
	type: THREE.HalfFloatType,
});

scene.environment = cubeRenderTarget.texture;

// Cube camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

function updateAllMaterials() {
	scene.traverse((child) => {
		if (child.isMesh && child.material.isMeshStandardMaterial) {
			child.material.envMapIntensity = tweaks.envMapIntensity;
		}
	});
}

gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.05);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.2);

/**
 * Models
 */
const gltLoader = new GLTFLoader();

gltLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
	gltf.scene.scale.setScalar(10);
	scene.add(gltf.scene);

	updateAllMaterials();
});

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
	new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
	new THREE.MeshStandardMaterial({
		roughness: 0,
		metalness: 1,
		color: 0xaaaaaa,
	}),
);
torusKnot.position.x = -4;
torusKnot.position.y = 4;
scene.add(torusKnot);

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
camera.position.set(4, 5, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
let frame = 0;
const clock = new THREE.Clock();
const tick = () => {
	frame += 1;

	// Time
	const elapsedTime = clock.getElapsedTime();

	holyDonut.rotation.x = Math.sin(elapsedTime) * 3;

	if (frame % 1 === 0) {
		cubeCamera.update(renderer, scene);
	}

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

updateAllMaterials();
tick();
