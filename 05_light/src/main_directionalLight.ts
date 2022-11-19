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


/**
 * 1. 添加灯光、阴影
 *  材质要对光有反应
 *  灯光开启投射阴影 light.castShadow = true
 *  物体要接受或者投射阴影 mesh.castShadow = true; mesh.receiveShadow = true
 *  渲染器开启shadowMap  renderer.shadowMap.enabled = true
 *
 */

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 10, 10)
directionalLight.castShadow = true
// 2. 设置投射阴影属性
// 阴影质量，值越高，质量越好，消耗的性能越高
directionalLight.shadow.mapSize.set(1024, 1024) // default 512,512
// 阴影相机
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20
directionalLight.shadow.camera.top = 3
directionalLight.shadow.camera.bottom = -3
directionalLight.shadow.camera.left = -3
directionalLight.shadow.camera.right = 3

// 设置阴影边缘模糊半径
directionalLight.shadow.radius = 3

scene.add(directionalLight)


// debug
const gui = new dat.GUI()
gui.add(directionalLight.shadow.camera, "near").min(1).max(20).step(0.1).onChange(() => {
  directionalLight.shadow.camera.updateProjectionMatrix()
})

gui.add(directionalLight.shadow, "radius").min(1).max(20).step(0.1)


const geometery = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshStandardMaterial()
const cube = new THREE.Mesh(geometery, material)
cube.castShadow = true
cube.position.set(0, 1, 0)
scene.add(cube)

const planeGeometry = new THREE.PlaneGeometry(10, 10)
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotation.x = - Math.PI / 2
plane.position.y = -1
plane.receiveShadow = true
scene.add(plane)



const helper = new THREE.AxesHelper(10)
scene.add(helper)


const renderer = new THREE.WebGLRenderer()
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
