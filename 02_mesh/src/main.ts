import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;
camera.lookAt(0, 0, 0);
scene.add(camera);

const helper = new THREE.AxesHelper(5);
scene.add(helper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// 顺或逆时针 描绘三角形
// const geometry = new THREE.BufferGeometry();
// const points = new Float32Array([
//   -1, 1, 1,
//   -1, -1, 1,
//   1, -1, 1,

//   1, -1, 1,
//   1, 1, 1,
//   -1, 1, 1,
// ])
// geometry.setAttribute("position", new THREE.BufferAttribute(points, 3))
// const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide}))
// scene.add(mesh)

function generatePoints(number: number) {
  const points = new Float32Array(number * 3) 
  for (let i = 0; i < number * 3; i++) {
    points[i] = Math.random() * 10 - 5
  }
  return points
}

const COUNT = 50
for (let i = 0; i < COUNT; i++) {
  const geometry = new THREE.BufferGeometry()
  const points = generatePoints(3)
  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3))
  const color = new THREE.Color(Math.random(), Math.random(), Math.random())
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide}))
  scene.add(mesh)
}


function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  
}

window.addEventListener("resize", (evt) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("dblclick", (evt) => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    renderer.domElement.requestFullscreen();
  }
});

render();
