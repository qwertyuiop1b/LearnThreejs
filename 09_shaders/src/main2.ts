import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertShader from "./shaders2/vert.glsl";
import fragmentShader from "./shaders2/fragment.glsl";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  30
);
camera.position.z = 5;
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

// shaderMaterial or rawShaderMaterial
const geometry = new THREE.PlaneGeometry(5, 5, 20, 20);

const material = new THREE.RawShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {},
});

const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.y = -Math.PI * 0.1;
mesh.rotation.z = -Math.PI * 0.1;
scene.add(mesh);

const helper = new THREE.AxesHelper(10);
scene.add(helper);

function render() {
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
