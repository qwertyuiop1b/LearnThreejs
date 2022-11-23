import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import dat from "dat.gui";
import vertShader from "./shaders/vert.glsl";
import fragmentShader from "./shaders/fragment.glsl";

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
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}
geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/textures/flag-french.jpg");

const material = new THREE.RawShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragmentShader,
  // wireframe: true,
  side: THREE.DoubleSide,
  uniforms: {
    // uFrequency: { value: 3 },
    uFrequency: { value: new THREE.Vector2(3, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: texture },
  },
});

const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

// gui
const gui = new dat.GUI();
gui
  .add(material.uniforms.uFrequency.value, "x")
  .min(0)
  .max(20)
  .step(0.01)
  .name("FrequencyX");
gui
  .add(material.uniforms.uFrequency.value, "y")
  .min(0)
  .max(20)
  .step(0.01)
  .name("FrequencyY");

const helper = new THREE.AxesHelper(10);
scene.add(helper);

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
};

function render() {
  tick();
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
