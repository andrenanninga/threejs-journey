import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
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
const matcap = textureLoader.load('/textures/matcaps/4.png');
matcap.minFilter = THREE.NearestFilter;
matcap.magFilter = THREE.NearestFilter;

/**
 * Fonts
 */
const fontLoader = new FontLoader();
fontLoader.loadAsync('/fonts/helvetiker_bold.typeface.json').then((font) => {
	const textGeometry = new TextGeometry('Hello World!', {
		font,
		size: 0.5,
		height: 0.2,
		bevelEnabled: true,
		curveSegments: 4,
		bevelThickness: 0.02,
		bevelSize: 0.02,
		bevelOffset: 0,
		bevelSegments: 5,
	});

	const material = new THREE.MeshMatcapMaterial({ matcap });

	const text = new THREE.Mesh(textGeometry, material);
	textGeometry.center();

	scene.add(text);

	console.time('donuts');

	const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

	for (let i = 0; i < 1000; i++) {
		const donut = new THREE.Mesh(donutGeometry, material);
		donut.position.set(
			THREE.MathUtils.randFloatSpread(30),
			THREE.MathUtils.randFloatSpread(30),
			THREE.MathUtils.randFloatSpread(30),
		);

		donut.rotation.set(
			THREE.MathUtils.randFloatSpread(Math.PI),
			THREE.MathUtils.randFloatSpread(Math.PI),
			0,
		);

		donut.scale.setScalar(THREE.MathUtils.randFloat(0.25, 1));

		scene.add(donut);
	}

	console.timeEnd('donuts');
});

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

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
