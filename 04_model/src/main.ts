import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 20);
scene.add(camera);

const helper = new THREE.AxesHelper(10);
scene.add(helper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement);

const textLoader = new THREE.TextureLoader()
const armTexture = textLoader.load("/rocky_trail_4k.gltf/textures/rocky_trail_arm_4k.jpg")
const diffTexture = textLoader.load("/rocky_trail_4k.gltf/textures/rocky_trail_diff_4k.jpg")
const norTexture = textLoader.load("/rocky_trail_4k.gltf/textures/rocky_trail_nor_gl_4k.jpg")

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xdfdfdf,
  side: THREE.DoubleSide,
  envMap: armTexture,
  map: diffTexture,
  normalMap: norTexture
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// 默认版models
const gltfLoader = new GLTFLoader();
// gltfLoader.load("/models/Duck/glTF/Duck.gltf", (gltf) => {
//   // 添加单个model到场景中
//   console.log(gltf)
//   scene.add(gltf.scene.children[0])
// });

// gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", gltf => {
//   console.log(gltf)
//   // for循环有问题，因为从一个scene添加mesh，会自动去除这个mesh
//   // for (const child of gltf.scene.children) {
//   //   scene.add(child)
//   // }

//   // 1.
//   // while(gltf.scene.children.length) {
//   //   scene.add(gltf.scene.children[0])
//   // }

//   // 2.
//   // scene.add(...gltf.scene.children)

//   // 3.
//   scene.add(gltf.scene)
// })


// 压缩版models
// const darcoLoader = new DRACOLoader();
// darcoLoader.setDecoderPath("/draco/");  //复制/node_modules/three/example/js/libs/draco到public目录下最后必须有 /
// gltfLoader.setDRACOLoader(darcoLoader);
// gltfLoader.load("/models/Duck/glTF-Draco/Duck.gltf", (gltf) => {
//   scene.add(gltf.scene)
// });



let mixer: THREE.AnimationMixer | null = null
gltfLoader.load("/models/Fox/glTF/Fox.gltf", gltf => {
  console.log(gltf)
  // 加载的scene过大，缩放scene
  gltf.scene.scale.set(0.025, 0.025, 0.025)
  scene.add(gltf.scene)
  // 加载动画
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action = mixer.clipAction(gltf.animations[2])
  // 单纯调用play()不行，要每一帧更新才行
  action.play()
})


gltfLoader.load("/rocky_trail_4k.gltf/rocky_trail_4k.gltf", gltf => {
  console.log(gltf)
  scene.add(gltf.scene)
})






const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;


const clock = new THREE.Clock()
let currentTime = 0
function render() {
  const elapsedTime = clock.getElapsedTime()
  const delta = elapsedTime - currentTime
  currentTime = elapsedTime
  // console.log((delta * 1000).toFixed(1))
  requestAnimationFrame(render);
  controls.update();
  mixer?.update(delta)
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
});

render();
