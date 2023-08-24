import * as THREE from "three";
import gsap from "gsap";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
	width: 800,
	height: 600,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

gsap.to(mesh.position, { x: 2, duration: 1, delay: 2 });
gsap.to(mesh.position, { x: 0, duration: 1, delay: 3 });

const clock = new THREE.Clock(true);

function tick() {
	const t = clock.getElapsedTime();

	// mesh.position.x = Math.sin(t);
	mesh.position.y = Math.cos(t);

	mesh.rotation.z = Math.sin(t) * 2;
	mesh.rotation.y = mesh.position.x;

	// camera.position.z = 3 + Math.sin(t);

	renderer.render(scene, camera);

	requestAnimationFrame(tick);
}

tick();
