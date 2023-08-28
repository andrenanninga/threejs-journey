import * as THREE from 'three';
import * as dat from 'lil-gui';
import gsap from 'gsap';

THREE.ColorManagement.enabled = false;

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
	materialColor: '#7861cc',
	objectsDistance: 5.5,
	cameraDistance: 8,
	parallexStrengh: 0.4,
	parallexSmooth: 2,
	particlesCount: 2000,
};

gui.addColor(parameters, 'materialColor').onChange(() => {
	material.color.set(parameters.materialColor);
	particlesMaterial.color.set(parameters.materialColor);
});

gui
	.add(parameters, 'objectsDistance')
	.min(-10)
	.max(10)
	.step(0.1)
	.onChange(() => {
		mesh1.position.y = -parameters.objectsDistance * 0;
		mesh2.position.y = -parameters.objectsDistance * 1;
		mesh3.position.y = -parameters.objectsDistance * 2;
	});

gui
	.add(parameters, 'cameraDistance')
	.min(1)
	.max(20)
	.step(0.1)
	.onChange(() => {
		camera.position.z = parameters.cameraDistance;
	});

gui.add(parameters, 'parallexStrengh').min(-2).max(2).step(0.1);
gui.add(parameters, 'parallexSmooth').min(0).max(4).step(0.1);
gui
	.add(parameters, 'particlesCount')
	.min(0)
	.max(5000)
	.step(25)
	.onChange(() => {
		generateParticles();
	});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshToonMaterial({
	color: parameters.materialColor,
	gradientMap: gradientTexture,
});

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 69), material);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(
	new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
	material,
);

mesh1.position.y = -parameters.objectsDistance * 0;
mesh2.position.y = -parameters.objectsDistance * 1;
mesh3.position.y = -parameters.objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */

const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.particlesCount * 3);

const particlesMaterial = new THREE.PointsMaterial({
	color: parameters.materialColor,
	size: 0.04,
	sizeAttenuation: true,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);

function generateParticles() {
	const positions = new Float32Array(parameters.particlesCount * 3);

	for (let i = 0; i < parameters.particlesCount; i++) {
		positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(10);
		positions[i * 3 + 1] = THREE.MathUtils.randFloat(
			parameters.objectsDistance / 2,
			-sectionMeshes.length * parameters.objectsDistance,
		);
		positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(20);
	}

	const positionsAttribute = new THREE.BufferAttribute(positions, 3);
	particlesGeometry.setAttribute('position', positionsAttribute);
}

generateParticles();
scene.add(particles);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
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
	35,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.z = parameters.cameraDistance;

const cameraHolder = new THREE.Group();
cameraHolder.add(camera);
scene.add(cameraHolder);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Cursor
 */
const cursor = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / window.innerWidth - 0.5;
	cursor.y = event.clientY / window.innerHeight - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();

let activeSection = 0;

const tick = () => {
	const delta = clock.getDelta();

	for (const mesh of sectionMeshes) {
		mesh.rotation.x += 0.1 * delta;
		mesh.rotation.y += 0.12 * delta;
	}

	// Animated camera position
	const parallexX = cursor.x * parameters.parallexStrengh;
	const parallexY = -cursor.y * parameters.parallexStrengh;

	const scrollDistance =
		window.scrollY / (document.body.clientHeight - window.innerHeight);

	const currentSection = THREE.MathUtils.clamp(
		Math.floor((scrollDistance - 0.1) * sectionMeshes.length),
		0,
		sectionMeshes.length - 1,
	);

	if (currentSection !== activeSection) {
		const sectionMesh = sectionMeshes[currentSection];
		gsap.to(sectionMesh.rotation, {
			duration: 1.5,
			ease: 'power2.inOut',
			x: '+= 6',
			y: '+= 3',
			z: '+= 4',
		});

		activeSection = currentSection;
	}

	console.log(currentSection);

	cameraHolder.position.y =
		parameters.objectsDistance * (sectionMeshes.length - 1) * -scrollDistance;

	camera.position.x +=
		(parallexX - camera.position.x) * parameters.parallexSmooth * delta;
	camera.position.y +=
		(parallexY - camera.position.y) * parameters.parallexSmooth * delta;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
