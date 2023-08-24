import * as THREE from "three";

const size = {
	width: 800,
	height: 600,
};

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
	color: 0xff0000,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const camera = new THREE.PerspectiveCamera(75, size.width / size.height);
camera.position.set(2, 1, 3);
camera.lookAt(mesh.position);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector(".webgl"),
});

renderer.setSize(size.width, size.height);

renderer.render(scene, camera);
