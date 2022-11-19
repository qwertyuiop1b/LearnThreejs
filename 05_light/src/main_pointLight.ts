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


const lightBall = new THREE.Mesh(
  new THREE.SphereGeometry(.2, 32, 32),
  new THREE.MeshBasicMaterial({color: 0xff00ff})
)
lightBall.position.set(5, 5, 5)


const pointLight = new THREE.PointLight(0xff00ff, 3)
pointLight.castShadow = true
pointLight.decay = 1 

pointLight.shadow.mapSize.set(2048, 2048) // default 512,512
// 设置阴影边缘模糊半径
pointLight.shadow.radius = 3
lightBall.add(pointLight)
scene.add(lightBall)



// debug
const gui = new dat.GUI()

gui.add(pointLight.shadow, "radius").min(1).max(20).step(0.1)
gui.add(pointLight, "distance").min(0).max(500).step(0.01)
gui.add(pointLight, "decay").min(0).max(5).step(0.01)



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


const clock = new THREE.Clock()

function render() {
  const elapsedTime = clock.getElapsedTime()
  lightBall.position.x = Math.cos(elapsedTime) * 5
  lightBall.position.z = Math.sin(elapsedTime) * 5

  lightBall.position.y = 3 + Math.sin(elapsedTime) * 3

  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
