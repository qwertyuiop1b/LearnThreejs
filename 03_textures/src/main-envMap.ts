import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import dat from "dat.gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"

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



// cubeTexture
/**
 * px -> nx -> py -> ny 顺序
 * 注意的是物体要设置金属度、粗糙度
 */
// const cubeTextureLoader = new THREE.CubeTextureLoader()
// const cubeTexture = cubeTextureLoader.setPath("/environmentMaps/0/").load([
//   "px.jpg",
//   "nx.jpg",
//   "py.jpg",
//   "ny.jpg",
//   "pz.jpg",
//   "nz.jpg",
// ])
// scene.background = cubeTexture

// const sphereGeometry = new THREE.SphereGeometry(1, 100, 100)
// const material = new THREE.MeshStandardMaterial({
//   envMap: cubeTexture,
//   metalness: 1,
//   roughness: 0,
// })
// const sphere = new THREE.Mesh(sphereGeometry, material)
// scene.add(sphere)



const sphereGeometry = new THREE.SphereGeometry(5, 100, 100)
const material = new THREE.MeshStandardMaterial({
  metalness: 1,
  roughness: 0,
})
const sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)


// hdr 环境贴图
const rgbeLoader = new RGBELoader()
rgbeLoader.loadAsync("/hdr/012.hdr").then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  // 设置场景的background
  scene.background = texture
  // 给场景中的物体添加默认的环境贴图
  scene.environment = texture
})


// light
const ambientLight = new THREE.AmbientLight(0xffffff, .3)
scene.add(ambientLight)

// dirctionalLight
const dirctionalLight = new THREE.DirectionalLight(0xffffff, 1)
dirctionalLight.position.set(0, 3, 5)
scene.add(dirctionalLight)


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
