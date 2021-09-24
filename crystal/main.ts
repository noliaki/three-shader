import './style.css'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  TextureLoader,
  BufferGeometry,
  BufferAttribute,
  DoubleSide,
  OctahedronGeometry,
  MeshToonMaterial,
} from 'three'
import { debounce } from '../src/utility'
import vertexShader from './vertex-shader'
import fragmentShader from './fragment-shader'

const renderer = new WebGLRenderer({})
const scene = new Scene()
const camera = new OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  -window.innerHeight / 2,
  window.innerHeight / 2,
  -1000,
  1000
)
const texture = new TextureLoader().load('/photo0000-0222.jpg')
texture.flipY = false

const mesh = new Mesh()
mesh.geometry = createGeometry()
mesh.material = new ShaderMaterial({
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
  side: DoubleSide,
})

let progress = 0

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    mesh.geometry = createGeometry()

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
update()

function update(): void {
  const material = mesh.material as ShaderMaterial

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

function createGeometry(): BufferGeometry {
  const geometry = new OctahedronGeometry(100)

  console.log(geometry.attributes)

  geometry.attributes.uv.setXY

  // prettier-ignore
  // const position = [
  //   -1, 1, 0,
  //   1, 1, 0,
  //   -1, -1, 0,

  //   1, -1, 1,
  //   1, 1, 0,
  //   -2, -1, -10
  // ]

  // geometry.setAttribute(
  //   'position',
  //   new BufferAttribute(
  //     new Float32Array(position.map((val: number): number => val * 100)),
  //     3
  //   )
  // )

  return geometry
}
