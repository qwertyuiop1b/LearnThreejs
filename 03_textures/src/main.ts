import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 20);
camera.lookAt(0, 0, 0);
scene.add(camera);

const geometry = new THREE.BoxGeometry(5, 5, 5);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 2.5, 0);
scene.add(cube);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// helper
const helper = new THREE.AxesHelper(15);
scene.add(helper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", (evt) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

render();
