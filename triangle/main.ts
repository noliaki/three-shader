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
  0,
  1000
)
const texture = new TextureLoader().load('/photo0000-0222.jpg')
texture.flipY = false
const geometry = createGeometry()
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
  side: DoubleSide,
})

const mesh = new Mesh(geometry, material)
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

function createGeometry(
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  widthSegment: number = 50,
  heightSegment: number = 50
): BufferGeometry {
  const segments = widthSegment * heightSegment

  const top = -(height / 2)
  const left = -(width / 2)

  const cellWidth = width / widthSegment
  const cellHeight = height / heightSegment

  const position = []
  const index = []
  const normal = []
  const uv = []
  const stagger = []

  for (let i: number = 0; i < segments; i++) {
    const row = Math.floor(i / widthSegment)
    const col = i % widthSegment
    const step = i * 3 * 2

    position.push(col * cellWidth + left)
    position.push(row * cellHeight + top)
    position.push(0)
    normal.push(0)
    normal.push(0)
    normal.push(1)
    stagger.push(Math.random())
    stagger.push(Math.random())
    stagger.push(Math.random())
    uv.push(col / widthSegment)
    uv.push(row / heightSegment)
    index.push(step + 0)

    position.push((col + 1) * cellWidth + left)
    position.push(row * cellHeight + top)
    position.push(0)
    normal.push(0)
    normal.push(0)
    normal.push(1)
    stagger.push(Math.random())
    stagger.push(Math.random())
    stagger.push(Math.random())
    uv.push((col + 1) / widthSegment)
    uv.push(row / heightSegment)
    index.push(step + 1)

    position.push(col * cellWidth + left)
    position.push((row + 1) * cellHeight + top)
    position.push(0)
    normal.push(0)
    normal.push(0)
    normal.push(1)
    stagger.push(Math.random())
    stagger.push(Math.random())
    stagger.push(Math.random())
    uv.push(col / widthSegment)
    uv.push((row + 1) / heightSegment)
    index.push(step + 2)

    position.push((col + 1) * cellWidth + left)
    position.push(row * cellHeight + top)
    position.push(0)
    normal.push(0)
    normal.push(0)
    normal.push(1)
    stagger.push(Math.random())
    stagger.push(Math.random())
    stagger.push(Math.random())
    uv.push((col + 1) / widthSegment)
    uv.push(row / heightSegment)
    index.push(step + 3)

    position.push((col + 1) * cellWidth + left)
    position.push((row + 1) * cellHeight + top)
    position.push(0)
    normal.push(0)
    normal.push(0)
    normal.push(1)
    stagger.push(Math.random())
    stagger.push(Math.random())
    stagger.push(Math.random())
    uv.push((col + 1) / widthSegment)
    uv.push((row + 1) / heightSegment)
    index.push(step + 4)

    position.push(col * cellWidth + left)
    position.push((row + 1) * cellHeight + top)
    position.push(0)
    normal.push(0)
    normal.push(0)
    normal.push(1)
    stagger.push(Math.random())
    stagger.push(Math.random())
    stagger.push(Math.random())
    uv.push(col / widthSegment)
    uv.push((row + 1) / heightSegment)
    index.push(step + 5)
  }

  const geometry = new BufferGeometry()

  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(position), 3)
  )
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  geometry.setAttribute(
    'normal',
    new BufferAttribute(new Float32Array(normal), 3)
  )
  geometry.setAttribute(
    'stagger',
    new BufferAttribute(new Float32Array(stagger), 3)
  )
  geometry.setAttribute(
    'index',
    new BufferAttribute(new Float32Array(index), 1)
  )

  geometry.setIndex(index)

  console.log(
    new PlaneBufferGeometry(width, height, widthSegment, heightSegment)
  )
  console.log(geometry)

  return geometry
}
