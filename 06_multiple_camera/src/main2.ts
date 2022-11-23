import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const cameras = [
  {
    width: 0.5,
    height: 0.5,
    x: 0.5,
    y: 0.5,
    up: [0, 1, 0],
    background: new THREE.Color(1, 1, 0.8),
    updateCamera(camera: THREE.OrthographicCamera, scene: THREE.Scene) {
      console.log(this);
      camera.lookAt(scene.position);
    },
  },
  {
    width: 0.5,
    height: 0.5,
    x: 0.5,
    y: 0,
    up: [1, 0, 0],
    updateCamera(camera: THREE.OrthographicCamera, scene: THREE.Scene) {
      console.log(this);

      camera.up.fromArray(this.up);
      camera.lookAt(scene.position);
    },
    background: new THREE.Color(0.5, 0.7, 0.7),
  },
];

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.OrthographicCamera(
  -16,
   16,
   16,
  -16,
  1,
  1000
);
scene.add(camera);
camera.position.set(10, 0, 0);
camera.lookAt(scene.position);

const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(cubeGeometry, material);
cube.position.set(0, 1, 0);
scene.add(cube);

const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const coneGeometry = new THREE.ConeGeometry(1, 3, 32);
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.set(0, 4, 3);
scene.add(cone);

const helper = new THREE.AxesHelper(10);
scene.add(helper);

const cameraHelper = new THREE.CameraHelper(camera)
scene.add(cameraHelper)

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(size.width, size.height);
const container = document.querySelector("#app")!;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

renderer.render(scene, camera);

function render() {
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

render()

// renderer.render(scene, camera);

// function render() {
//   renderer.render(scene, camera);
//   controls.update();
//   requestAnimationFrame(render);
// }
// render();

// const cameraList = [];

// function render() {
//   cameras.forEach((cameraItem) => {
//     const camera = new THREE.OrthographicCamera(
//       -300 / 2,
//       300 / 2,
//       300 / 2,
//       -300 / 2,
//       1,
//       1000
//     );
//     camera.up.fromArray(cameraItem.up);
//     scene.add(camera);
//     camera.lookAt(scene.position);

//     const left = Math.floor(size.width * cameraItem.x);
//     const bottom = Math.floor(size.height * cameraItem.y);
//     const width = Math.floor(size.width * cameraItem.width);
//     const height = Math.floor(size.height * cameraItem.height);

//     console.log(left, bottom, width, height);

//     renderer.setViewport(left, bottom, width, height);
//     renderer?.setScissor(left, bottom, width, height);
//     renderer?.setScissorTest(true);
//     renderer?.setClearColor(cameraItem.background);
//     renderer.render(scene, camera);
//   });
// }
// render();
// function updateCamera() {}

// window.addEventListener("resize", () => {
//   size.width = window.innerWidth;
//   size.height = window.innerHeight;
// });
