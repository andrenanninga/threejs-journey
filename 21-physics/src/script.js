import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import * as CANNON from 'cannon-es';

THREE.ColorManagement.enabled = false;

/**
 * Debug
 */
const gui = new dat.GUI();

const debug = {
	createBox: () => {
		const position = new THREE.Vector3(
			THREE.MathUtils.randFloatSpread(5),
			THREE.MathUtils.randFloat(3, 6),
			THREE.MathUtils.randFloatSpread(5),
		);

		createBox(
			THREE.MathUtils.randFloat(0.1, 0.8),
			THREE.MathUtils.randFloat(0.1, 0.8),
			THREE.MathUtils.randFloat(0.1, 0.8),
			position,
		);
	},
	createSphere: () => {
		const position = new THREE.Vector3(
			THREE.MathUtils.randFloatSpread(5),
			THREE.MathUtils.randFloat(3, 6),
			THREE.MathUtils.randFloatSpread(5),
		);
		createSphere(THREE.MathUtils.randFloat(0.05, 0.4), position);
	},
	reset: () => {
		for (const object of objectsToUpdate) {
			object.body.removeEventListener('collide', playHitSound);
			world.removeBody(object.body);
			scene.remove(object.mesh);
		}

		objectsToUpdate.splice(0, objectsToUpdate.length);
	},
};

gui.add(debug, 'createBox');
gui.add(debug, 'createSphere');
gui.add(debug, 'reset');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3');

function playHitSound(collision) {
	const impactStrength = collision.contact.getImpactVelocityAlongNormal();

	if (impactStrength <= 1.5) {
		return;
	}

	hitSound.volume = THREE.MathUtils.clamp(
		THREE.MathUtils.mapLinear(impactStrength, 1.5, 10, 0, 1),
		0,
		1,
	);
	hitSound.playbackRate = THREE.MathUtils.randFloat(0.6, 1.4);
	hitSound.currentTime = 0;
	hitSound.preservesPitch = false;
	hitSound.play();
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
	'/textures/environmentMaps/1/px.png',
	'/textures/environmentMaps/1/nx.png',
	'/textures/environmentMaps/1/py.png',
	'/textures/environmentMaps/1/ny.png',
	'/textures/environmentMaps/1/pz.png',
	'/textures/environmentMaps/1/nz.png',
]);

/**
 * Physics
 */

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.allowSleep = true;
world.broadphase = new CANNON.SAPBroadphase(world);

// Materials
// const concreteMaterial = new CANNON.Material('concrete');
// const plasticMaterial = new CANNON.Material('plastic');

// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
// 	concreteMaterial,
// 	plasticMaterial,
// 	{
// 		friction: 0.1,
// 		restitution: 0.9,
// 	},
// );

// world.addContactMaterial(concretePlasticContactMaterial);
const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultMaterial,
	defaultMaterial,
	{
		friction: 0.8,
		restitution: 0.7,
	},
);

world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
	mass: 0,
	shape: floorShape,
});

floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
		color: '#777777',
		metalness: 0.3,
		roughness: 0.4,
		envMap: environmentMapTexture,
		envMapIntensity: 0.5,
	}),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Utils
 */
const objectsToUpdate = [];

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
	metalness: 0.3,
	roughness: 0.4,
	envMap: environmentMapTexture,
	color: 0x4da6ff,
});

function createSphere(radius, position) {
	const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
	mesh.scale.setScalar(radius);

	mesh.castShadow = true;
	mesh.position.copy(position);

	scene.add(mesh);

	const shape = new CANNON.Sphere(radius);
	const body = new CANNON.Body({
		mass: 1,
		shape,
	});

	body.position.copy(position);
	body.addEventListener('collide', playHitSound);

	world.addBody(body);

	objectsToUpdate.push({
		mesh,
		body,
	});
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
	metalness: 0.1,
	roughness: 0.8,
	envMap: environmentMapTexture,
	color: 0xf2a65e,
});

function createBox(width, height, depth, position) {
	const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
	mesh.scale.set(width, height, depth);

	mesh.castShadow = true;
	mesh.position.copy(position);

	scene.add(mesh);

	const shape = new CANNON.Box(
		new CANNON.Vec3(width / 2, height / 2, depth / 2),
	);
	const body = new CANNON.Body({
		mass: 1,
		shape,
	});

	body.position.copy(position);
	body.addEventListener('collide', playHitSound);

	world.addBody(body);

	objectsToUpdate.push({
		mesh,
		body,
	});
}

/**
 * Animate
 */
const clock = new THREE.Clock();

let oldElapsedTime = 0;
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	// Update physics
	world.step(1 / 60, deltaTime, 3);

	for (const objectToUpdate of objectsToUpdate) {
		objectToUpdate.mesh.position.copy(objectToUpdate.body.position);
		objectToUpdate.mesh.quaternion.copy(objectToUpdate.body.quaternion);
	}

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
