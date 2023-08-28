import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
 * Objects
 */
const object1 = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 16, 16),
	new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 16, 16),
	new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);

const object3 = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 16, 16),
	new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);
object3.position.x = 2;

scene.add(object1, object2, object3);

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

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
 * Cursor
 */
const mouse = new THREE.Vector2(-10, -10);

document.addEventListener('mousemove', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = (-event.clientY / window.innerHeight) * 2 + 1;
});

document.addEventListener('click', () => {
	if (currentIntersection) {
		currentIntersection.object.material.color.set(
			THREE.MathUtils.randInt(0, 0xffffff),
		);
	}
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
 * Model
 */
const gltfLoader = new GLTFLoader();
let duck;
gltfLoader.load('/models/Duck/glTF-Binary/Duck.glb', (gltf) => {
	duck = gltf.scene;
	duck.position.y = -1.2;

	scene.add(duck);
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

/**
 * Animate
 */
const clock = new THREE.Clock();

let currentIntersection = null;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	object1.position.y = Math.sin(elapsedTime * 0.3) * 2.5;
	object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
	object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

	// Cast a ray
	raycaster.setFromCamera(mouse, camera);

	const objectsToTest = [object1, object2, object3];
	const intersections = raycaster.intersectObjects(objectsToTest);

	if (intersections.length > 0) {
		if (currentIntersection === null) {
			currentIntersection = intersections[0];
		}

		currentIntersection = intersections[0];
	} else {
		currentIntersection = null;
	}

	if (duck) {
		console.log(duck);
		const duckIntersections = raycaster.intersectObject(duck, true);

		if (duckIntersections.length > 0) {
			duck.scale.setScalar(1.2);
		} else {
			duck.scale.setScalar(1);
		}
	}

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
