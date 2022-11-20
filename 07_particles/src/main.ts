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

// const helper = new THREE.AxesHelper(15);
// scene.add(helper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

function createPoints(url: string, size = 15, count = 5000) {
  // load textures
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(url);

  // const geometry = new THREE.SphereGeometry(10, 64, 64)
  // 自定义几何体
  const geometry = new THREE.BufferGeometry();
  const positionAry = new Float32Array(count * 3);
  const colorsAry = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positionAry[i * 3] = (Math.random() * 2 - 1) * 40;
    positionAry[i * 3 + 1] = (Math.random() * 2 - 1) * 40;
    positionAry[i * 3 + 2] = (Math.random() * 2 - 1) * 40;

    colorsAry[i * 3] = Math.random();
    colorsAry[i * 3 + 1] = Math.random();
    colorsAry[i * 3 + 2] = Math.random();
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positionAry, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colorsAry, 3));

  const material = new THREE.PointsMaterial({ color: 0xff00ff, size: size});
  material.sizeAttenuation = false;

  material.map = texture;
  // 去除黑色边缘
  material.transparent = true;
  material.alphaMap = texture;

  // 禁用深度写入
  material.depthWrite = false;
  // 叠加
  material.blending = THREE.AdditiveBlending;

  // 启用顶点颜色
  material.vertexColors = true;

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points
}

// const points = createPoints("/particles/1.png", 15, 5000)
const heartPoints = createPoints("/particles/heart.png")


const clock = new THREE.Clock()

function render() {
  const elapsedTime = clock.getElapsedTime()
  heartPoints.rotation.x = elapsedTime * 0.2
  heartPoints.position.y = elapsedTime * 0.5
  
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

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

render();
