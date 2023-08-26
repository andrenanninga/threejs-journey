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

// Fog
const fog = new THREE.Fog(0x262837, 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const textures = {
	bricks: {
		ambientOcclusion: textureLoader.load(
			'/textures/bricks/ambientOcclusion.jpg',
		),
		color: textureLoader.load('/textures/bricks/color.jpg'),
		normal: textureLoader.load('/textures/bricks/normal.jpg'),
		roughness: textureLoader.load('/textures/bricks/roughness.jpg'),
	},
	door: {
		alpha: textureLoader.load('/textures/door/alpha.jpg'),
		ambientOcclusion: textureLoader.load('/textures/door/ambientOcclusion.jpg'),
		color: textureLoader.load('/textures/door/color.jpg'),
		height: textureLoader.load('/textures/door/height.jpg'),
		metalness: textureLoader.load('/textures/door/metalness.jpg'),
		normal: textureLoader.load('/textures/door/normal.jpg'),
		roughness: textureLoader.load('/textures/door/roughness.jpg'),
	},
	grass: {
		ambientOcclusion: textureLoader.load(
			'/textures/grass/ambientOcclusion.jpg',
		),
		color: textureLoader.load('/textures/grass/color.jpg'),
		normal: textureLoader.load('/textures/grass/normal.jpg'),
		roughness: textureLoader.load('/textures/grass/roughness.jpg'),
	},
};

textures.grass.ambientOcclusion.repeat.set(6, 6);
textures.grass.color.repeat.set(6, 6);
textures.grass.normal.repeat.set(6, 6);
textures.grass.roughness.repeat.set(6, 6);

textures.grass.ambientOcclusion.wrapS = THREE.RepeatWrapping;
textures.grass.ambientOcclusion.wrapT = THREE.RepeatWrapping;
textures.grass.color.wrapS = THREE.RepeatWrapping;
textures.grass.color.wrapT = THREE.RepeatWrapping;
textures.grass.normal.wrapS = THREE.RepeatWrapping;
textures.grass.normal.wrapT = THREE.RepeatWrapping;
textures.grass.roughness.wrapS = THREE.RepeatWrapping;
textures.grass.roughness.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
	new THREE.BoxGeometry(4, 2.5, 4),
	new THREE.MeshStandardMaterial(),
);

walls.position.y = 1.25;

walls.material.map = textures.bricks.color;
walls.material.aoMap = textures.bricks.ambientOcclusion;
walls.material.normalMap = textures.bricks.normal;
walls.material.roughnessMap = textures.bricks.roughness;

house.add(walls);

// Roof
const roof = new THREE.Mesh(
	new THREE.ConeGeometry(3.5, 1, 4),
	new THREE.MeshStandardMaterial({ color: 0xb35f45 }),
);

roof.rotation.y = Math.PI * 0.25;
roof.position.y = 2.5 + 0.5;

house.add(roof);

// Door
const door = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2, 64, 64),
	new THREE.MeshStandardMaterial(),
);

door.position.y = 0.9;
door.position.z = 2 - 0.03;

door.material.map = textures.door.color;
door.material.alphaMap = textures.door.alpha;
door.material.aoMap = textures.door.ambientOcclusion;
door.material.normalMap = textures.door.normal;
door.material.displacementMap = textures.door.height;
door.material.roughnessMap = textures.door.roughness;
door.material.metalnessMap = textures.door.metalness;
door.material.displacementScale = 0.1;
door.material.transparent = true;

house.add(door);

// Floor
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial(),
);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;

floor.material.map = textures.grass.color;
floor.material.aoMap = textures.grass.ambientOcclusion;
floor.material.normalMap = textures.grass.normal;
floor.material.roughnessMap = textures.grass.roughness;

scene.add(floor);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.setScalar(0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.setScalar(0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.setScalar(0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.setScalar(0.15);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);

// Graveyard
const graveyard = new THREE.Group();
scene.add(graveyard);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: 0xb2b6b1 });

for (let i = 0; i < 50; i++) {
	const distance = THREE.MathUtils.randFloat(3.5, 9);
	const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);

	const grave = new THREE.Mesh(graveGeometry, graveMaterial);

	grave.position.x = Math.sin(angle) * distance;
	grave.position.y = THREE.MathUtils.randFloat(0.2, 0.35);
	grave.position.z = Math.cos(angle) * distance;

	grave.rotation.x = THREE.MathUtils.randFloatSpread(0.2);
	grave.rotation.y = THREE.MathUtils.randFloatSpread(0.4);
	grave.rotation.z = THREE.MathUtils.randFloatSpread(0.2);

	graveyard.add(grave);
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.12);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight(0xb9d5ff, 0.12);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight(0xff7d46, 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight(0xff00ff, 2, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight(0x00ffff, 2, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight(0xffff00, 2, 3);
scene.add(ghost3);

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
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
renderer.setClearColor(0x262837);

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;

ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

graveyard.children.forEach((child) => {
	child.castShadow = true;
});

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	const ghost1Angle = elapsedTime * 0.5;
	ghost1.position.x = Math.cos(ghost1Angle) * 4;
	ghost1.position.y = Math.abs(Math.sin(elapsedTime * 3));
	ghost1.position.z = Math.sin(ghost1Angle) * 4;

	const ghost2Angle = -elapsedTime * 0.32;
	ghost2.position.x = Math.cos(ghost2Angle) * 5;
	ghost2.position.y = Math.abs(
		Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2),
	);
	ghost2.position.z = Math.sin(ghost2Angle) * 5;

	const ghost3Angle = -elapsedTime * 0.1;
	ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.2));
	ghost3.position.y = Math.abs(Math.sin(elapsedTime * 3));
	ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.3));

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
