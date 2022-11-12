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


// 加载器进度管理
let progress = ""
const progressElt = document.createElement("div")
progressElt.style.position = "fixed"
progressElt.style.top = "50%"
progressElt.style.left = "50%"
progressElt.style.width = "100px"
progressElt.style.height = "100px"
progressElt.style.lineHeight = "100px"
progressElt.style.fontSize = "24px"
progressElt.style.transform = "translate(-50%, -50%)"
progressElt.style.borderRadius = "50%"
progressElt.style.background = "rgba(0,0,0,.8)"
progressElt.style.color = "#fff"
progressElt.style.border = "1px solid #fff"
progressElt.style.textAlign = "center"


document.body.appendChild(progressElt)

const loadingManager = new THREE.LoadingManager(
  () => {
    progressElt.remove()
  },
  (url, loaded, total) => {
    progress  = (loaded / total * 100).toFixed() + "%"
    progressElt.innerHTML = progress
  },
  (url) => {
    console.log("error")
  }
)
const textureLoader = new THREE.TextureLoader(loadingManager);

const colorTexture = textureLoader.load("/door/color.jpg");
const alphaTexture = textureLoader.load("/door/alpha.jpg");
const aoTexture = textureLoader.load("/door/ambientOcclusion.jpg")
const displacementTexture = textureLoader.load("/door/height.jpg")
const metalTexture = textureLoader.load("/door/metalness.jpg")
const roughnessTexture = textureLoader.load('/door/roughness.jpg')
const normalTexture = textureLoader.load("/door/normal.jpg")



const geometry = new THREE.BoxGeometry(5, 5, 5, 100, 100, 100);
const material = new THREE.MeshStandardMaterial({
  // 颜色贴图
  map: colorTexture,
  // 透明贴图
  alphaMap: alphaTexture,
  transparent: true,
  side: THREE.DoubleSide,
  // 环境遮蔽贴图
  aoMap: aoTexture,
  // 位移贴图
  displacementMap: displacementTexture,
  displacementScale: .5,

  // roughness: .5,
  // metalness: .6,
  metalnessMap: metalTexture,
  roughnessMap: roughnessTexture,
  normalMap: normalTexture,
});
geometry.setAttribute("uv2", new THREE.BufferAttribute(geometry.attributes.uv.array, 2))
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 2.5, 0);
scene.add(cube);

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

// gui
const gui = new dat.GUI({
  width: 300,
});
gui.close()
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
