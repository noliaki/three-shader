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
import fragmentShader from './fragment-shader.glsl?raw'

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
console.log(geometry.getIndex())
console.log(geometry.attributes)
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
    setCamera()
    setRenderer()
  })
)

document.body.appendChild(renderer.domElement)

scene.add(mesh)

setCamera()
setRenderer()
update()

function update(): void {
  material.uniforms.time.value += 0.01
  material.needsUpdate = true

  renderer.render(scene, camera)

  requestAnimationFrame(() => {
    update()
  })
}

function setCamera(): void {
  const halfW = window.innerWidth / 2
  const halfH = window.innerHeight / 2

  camera.left = -halfW
  camera.right = halfW
  camera.top = -halfH
  camera.bottom = halfH

  camera.updateProjectionMatrix()
}

function setRenderer(): void {
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
}
