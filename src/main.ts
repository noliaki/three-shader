import './style.css'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  Mesh,
  BufferGeometry,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  DoubleSide,
  FrontSide,
  BackSide,
} from 'three'
import { debounce } from './utility'
import vertexShader from './vertex-shader.glsl?raw'
import fragmentShader from './fragment-shader'

const renderer = new WebGLRenderer({})
const scene = new Scene()
const camera = new OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  -window.innerHeight / 2,
  window.innerHeight / 2,
  0,
  1000
)
const geometry = new PlaneBufferGeometry(200, 200, 1, 1)
const material = new ShaderMaterial({
  uniforms: {
    time: {
      value: 0,
    },
    resolution: {
      value: [window.innerWidth, window.innerHeight],
    },
  },
  vertexShader,
  fragmentShader,
  side: BackSide,
})
const mesh = new Mesh(geometry, material)

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    setGeometry()
    setCamera()
    setRenderer()
  })
)

document.body.appendChild(renderer.domElement)

scene.add(mesh)

setCamera()
setRenderer()
setGeometry()
update()

function update(): void {
  material.uniforms.time.value += 0.01
  material.needsUpdate = true

  renderer.render(scene, camera)

  requestAnimationFrame(() => {
    update()
  })
}

function setCamera(
  width: number = window.innerWidth,
  height: number = window.innerHeight
): void {
  const halfW = width / 2
  const halfH = height / 2

  camera.left = -halfW
  camera.right = halfW
  camera.top = -halfH
  camera.bottom = halfH

  camera.updateProjectionMatrix()
}

function setRenderer(
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  devicePixelRatio: number = window.devicePixelRatio
): void {
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(width, height)
}

function setGeometry(
  width: number = window.innerWidth,
  height: number = window.innerHeight
): void {
  console.log(geometry.attributes)

  const halfW = width / 2
  const halfH = height / 2

  geometry.attributes.position.setXYZ(0, -halfW, halfH, 0)
  geometry.attributes.position.setXYZ(1, halfW, halfH, 0)
  geometry.attributes.position.setXYZ(2, -halfW, -halfH, 0)
  geometry.attributes.position.setXYZ(3, halfW, -halfH, 0)

  geometry.attributes.position.needsUpdate = true
}
