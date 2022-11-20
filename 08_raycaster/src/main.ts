import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  30
);
camera.position.z = 10;
camera.lookAt(0, 0, 0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const material = new THREE.MeshBasicMaterial({ wireframe: true });
const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const geometry = new THREE.BoxGeometry(1, 1, 1);

// create cubes
const cubes = [];
for (let i = -3; i < 3; i++) {
  for (let j = -3; j < 3; j++) {
    for (let z = -3; z < 3; z++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(i, j, z);
      scene.add(cube);
      cubes.push(cube);
    }
  }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


window.addEventListener("click", (evt: MouseEvent) => {
  mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mouse.y =  - ((evt.clientY / window.innerHeight) * 2 - 1);
  const intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach(intersect => {
    (intersect.object as THREE.Mesh).material = redMaterial
    
  })
});

function render() {
  raycaster.setFromCamera(mouse, camera);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("dblclick", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    renderer.domElement.requestFullscreen();
  }
});
