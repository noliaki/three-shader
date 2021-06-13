import './style.css'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  BackSide,
  TextureLoader,
} from 'three'
import { debounce } from './utility'
import vertexShader from './vertex-shader'
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
const texture = new TextureLoader().load('/photo0000-0222.jpg')
texture.flipY = false
const geometry = new PlaneBufferGeometry(200, 200, 100, 100)
const material = new ShaderMaterial({
  uniforms: {
    time: {
      value: 0,
    },
    resolution: {
      value: [window.innerWidth, window.innerHeight],
    },
    uTexture: {
      value: texture,
    },
    progress: {
      value: 0,
    },
  },
  vertexShader,
  fragmentShader,
  side: BackSide,
})

const mesh = new Mesh(geometry, material)
let progress = 0

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    setGeometry()
    setCamera()
    setRenderer()
  })
)

document
  .getElementById('range')
  ?.addEventListener('input', (event: Event): void => {
    progress = parseFloat((event.target as HTMLInputElement)?.value) / 1000
  })

document.body.appendChild(renderer.domElement)

scene.add(mesh)

setCamera()
setRenderer()
setGeometry()
update()

function update(): void {
  material.uniforms.time.value += 0.01
  material.uniforms.progress.value +=
    (progress - material.uniforms.progress.value) / 10

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
  const geometry = new PlaneBufferGeometry(width, height, 2, 2)

  mesh.geometry = geometry
}
