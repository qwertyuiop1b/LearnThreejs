import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 3;
camera.lookAt(0, 0, 0);
scene.add(camera);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;


const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load("/particles/2.png")

const geometery = new THREE.BufferGeometry()
const count = 5000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10
  colors[i] = Math.random()
}
geometery.setAttribute("position", new THREE.BufferAttribute(positions, 3))
geometery.setAttribute("color", new THREE.BufferAttribute(colors, 3))

const material = new THREE.PointsMaterial({
  color: 0xb5598a,
  size: 0.4,
  // map: texture  // 单纯设置map有边缘黑色，应该设置alpha map
  alphaMap: texture,
  transparent: true  // 但是还是有黑色边缘， 要启动alphaTest, 低于这个值不渲染
})
material.alphaTest = 0.001 // 解决了黑色边缘问题，但是还是有一个遮盖后面的物体， 禁用深度测试
// material.depthTest = false // 添加其他物体会粘附在上面
material.depthWrite = false

// 设置叠加效果
material.blending = THREE.AdditiveBlending

// 启用顶点颜色
material.vertexColors = true


// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial({color: 0xffffff})
// )
// scene.add(cube)



const points = new THREE.Points(geometery, material)

scene.add(points)


const clock = new THREE.Clock()


// todo: shader优化
const animateParticles = () => {
  const elapsedTime = clock.getElapsedTime()
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const x = points.geometry.attributes.position.array[i3]
    // @ts-ignore
    points.geometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x) 
  }
  points.geometry.attributes.position.needsUpdate = true
}


function render() {
  animateParticles()
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


