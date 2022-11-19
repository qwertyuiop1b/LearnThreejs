import './style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import dat from "dat.gui"

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(10, 10, 10)
scene.add(camera)


const ambientLight = new THREE.AmbientLight(0xffffff, .5)
scene.add(ambientLight)

const geometery = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshStandardMaterial()
const cube = new THREE.Mesh(geometery, material)
cube.castShadow = true
cube.position.set(0, 1, 0)
scene.add(cube)


/**
 * 1. 添加灯光、阴影
 *  材质要对光有反应
 *  灯光开启投射阴影 light.castShadow = true
 *  物体要接受或者投射阴影 mesh.castShadow = true; mesh.receiveShadow = true
 *  渲染器开启shadowMap  renderer.shadowMap.enabled = true
 *
 */

const spotLight = new THREE.SpotLight(0xffffff, 3)
spotLight.position.set(5, 10, 10)
spotLight.castShadow = true
spotLight.decay = 1 // 默认值   需开启renderer.physicallyCorrectLights
// 设置spotlight聚焦目标对象，要把spotlight.target添加到场景中
spotLight.target = cube
scene.add(spotLight.target)



// 2. 设置投射阴影属性
// 阴影质量，值越高，质量越好，消耗的性能越高
spotLight.shadow.mapSize.set(2048, 2048) // default 512,512
// 阴影相机
spotLight.shadow.camera.aspect = 0.4
spotLight.shadow.camera.far = 50




// 设置阴影边缘模糊半径
spotLight.shadow.radius = 3

scene.add(spotLight)

const cameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(cameraHelper)


// debug
const gui = new dat.GUI()

gui.add(spotLight.shadow, "radius").min(1).max(20).step(0.1)
gui.add(spotLight.shadow, "focus").min(0).max(1).step(0.01)

gui.add(spotLight, "distance").min(0).max(500).step(0.01)
gui.add(spotLight, "angle").min(Math.PI / 10).max(Math.PI / 2).step(0.001)

gui.add(spotLight.shadow.camera, "near").min(1).max(20).step(0.1).onChange(() => {
  spotLight.shadow.camera.updateProjectionMatrix()
  cameraHelper.update()
})

gui.add(spotLight.shadow.camera, "far").min(10).max(100).step(1).onChange(() => {
  spotLight.shadow.camera.updateProjectionMatrix()
  cameraHelper.update()
})

gui.add(spotLight.shadow.camera, "aspect").min(.3).max(3).step(0.1).onChange(() => {
  spotLight.shadow.camera.updateProjectionMatrix()
  cameraHelper.update()
})

gui.add(cube.position, "x").min(-5).max(5).step(0.01)

gui.add(spotLight, "penumbra").min(0).max(1).step(0.01)
gui.add(spotLight, "decay").min(0).max(5).step(0.01)



const planeGeometry = new THREE.PlaneGeometry(30, 30)
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotation.x = - Math.PI / 2
plane.position.y = -1
plane.receiveShadow = true
scene.add(plane)



const helper = new THREE.AxesHelper(10)
scene.add(helper)




const renderer = new THREE.WebGLRenderer({
  antialias: true
  
})
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.dampingFactor = 0.05
controls.enableDamping = true


function render() {
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
