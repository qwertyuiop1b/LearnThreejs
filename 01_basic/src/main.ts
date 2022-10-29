import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

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

// dat params
let isAnimate = false;
const params = {
  color: 0xff00ff,
  func: function () {
    isAnimate = isAnimate ? false : true;
  },
};
const geometry = new THREE.BoxGeometry(5, 5, 5);
const material = new THREE.MeshBasicMaterial({ color: params.color });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(5, 2.5, 0);
cube.rotation.y = Math.PI / 4;
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

// dat.gui
const gui = new dat.GUI({
  width: 300,
});
gui
  .add(cube.position, "x")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("设置cube的x轴坐标")
  .onFinishChange((val) => {
    console.log("finishChange", val);
  });
gui
  .add(cube.rotation, "y")
  .min(0)
  .max(Math.PI * 2)
  .step(0.01)
  .name("设置cube的旋转y轴");
gui.add(cube.material, "wireframe");
gui.addColor(params, "color").onChange((val) => {
  cube.material.color.set(val);
});
gui.add(params, "func");

const clock = new THREE.Clock();

function render() {
  // const sec = time * 0.01
  // cube.position.x = sec % 10

  if (isAnimate) {
    const elapsedTime = clock.getElapsedTime();
    cube.position.x = (elapsedTime * 3) % 5;
  }

  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}

render();
