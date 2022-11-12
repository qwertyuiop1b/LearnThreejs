import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import dat from "dat.gui";

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

// 纹理贴图
/**
 * 1.创建纹理加载器
 * 2.加载纹理图片
 * 3.材质添加纹理
 */

const textureLoader = new THREE.TextureLoader();
// map 与 color 存在，会做乘法运算
const colorTexture = textureLoader.load("/door/color.jpg");
const minecraft = textureLoader.load("/minecraft.png");
// 白色: 完全不透明 1; 黑色： 完全透明 0
const alphaTexture = textureLoader.load("/door/alpha.jpg");

// 环境遮挡贴图
const aoTexture = textureLoader.load("/door/ambientOcclusion.jpg")

// 设置纹理属性
// 纹理位移始终是按u、v位移，不管旋转多少度
// colorTexture.offset.set(0.3, 0.3);
// colorTexture.rotation = Math.PI / 4;
// colorTexture.center.set(0.5, 0.5);

// 纹理重复
// colorTexture.repeat.set(2, 3);
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.MirroredRepeatWrapping;

// 纹理显示算法
// minecraft.minFilter = THREE.NearestFilter;
// minecraft.minFilter = THREE.NearestMipMapNearestFilter

// 放大滤镜
// minecraft.magFilter = THREE.LinearFilter
// minecraft.magFilter = THREE.NearestFilter;

const geometry = new THREE.BoxGeometry(5, 5, 5);
const material = new THREE.MeshBasicMaterial({
  map: colorTexture,
  alphaMap: alphaTexture,
  // 设置透明贴图，必须设置transparent
  transparent: true,
  side: THREE.DoubleSide,
  // 设置环境遮挡贴图
  aoMap: aoTexture
});
console.log(geometry)
geometry.setAttribute("uv2", new THREE.BufferAttribute(geometry.attributes.uv.array, 2))
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 2.5, 0);
scene.add(cube);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);


// plane

const planeGeometry = new THREE.PlaneGeometry(5, 5)
planeGeometry.setAttribute("uv2", new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2))
const plane = new THREE.Mesh(
  planeGeometry,
  material
)
plane.position.set(10, 2.5, 0)
scene.add(plane)

// helper
const helper = new THREE.AxesHelper(15);
scene.add(helper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// gui

const gui = new dat.GUI({
  width: 300,
});
gui.add(colorTexture.offset, "x").min(0).max(1).step(0.01).name("offset.x");
gui.add(colorTexture.offset, "y").min(0).max(1).step(0.01).name("offset.y");

gui
  .add(colorTexture, "rotation")
  .min(0)
  .max(Math.PI)
  .step(0.01)
  .name("rotation");
gui.add(colorTexture.center, "x").min(0).max(1).step(0.01).name("center.x");
gui.add(colorTexture.center, "y").min(0).max(1).step(0.01).name("center.y");

const wrappMap = {
  RepeatWrapping: THREE.RepeatWrapping,
  MirroredRepeatWrapping: THREE.MirroredRepeatWrapping,
  ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
};
gui
  .add(colorTexture, "wrapS", wrappMap)
  .name("WrapS")
  .onFinishChange(() => {
    colorTexture.needsUpdate = true;
  });

gui
  .add(colorTexture, "wrapT", wrappMap)
  .name("WrapT")
  .onFinishChange(() => {
    colorTexture.needsUpdate = true;
  });

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
