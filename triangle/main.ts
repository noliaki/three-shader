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
  PerspectiveCamera,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { debounce } from '../src/utility'
import vertexShader from './vertex-shader'
import fragmentShader from './fragment-shader'

const renderer = new WebGLRenderer({})
const scene = new Scene()
const camera = new PerspectiveCamera()
const texture = new TextureLoader().load('/photo0000-0222.jpg')
// texture.flipY = false

const controls = new OrbitControls(camera, renderer.domElement)
// controls.listenToKeyEvents(document.documentElement)
// controls.enableDamping = true
// controls.maxPolarAngle = Math.PI / 2
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

document
  .getElementById('reset')!
  .addEventListener('click', (event: MouseEvent): void => {
    event.preventDefault()
    setCamera()
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
    (progress - material.uniforms.progress.value) / 40

  material.needsUpdate = true

  controls.update()

  renderer.render(scene, camera)

  requestAnimationFrame(() => {
    update()
  })
}

function setCamera(
  width: number = window.innerWidth,
  height: number = window.innerHeight
): void {
  // const halfW = width / 2
  // const halfH = height / 2

  // camera.left = -halfW
  // camera.right = halfW
  // camera.top = -halfH
  // camera.bottom = halfH

  const fov = 1
  const fovRad = (fov / 2) * (Math.PI / 180)
  const dist = height / 2 / Math.tan(fovRad)

  camera.fov = fov
  camera.aspect = width / height
  camera.near = 1000
  camera.far = dist * 2

  camera.position.set((width / 2) * -1, (height / 2) * -1, dist)

  camera.updateProjectionMatrix()
  controls.update()
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
  widthSegment: number = 120,
  heightSegment: number = 1200
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
  const center = []

  for (let i: number = 0; i < segments; i++) {
    const row = Math.floor(i / widthSegment)
    const col = i % widthSegment
    const step = i * 3 * 2

    const x1 = col * cellWidth + left
    const y1 = row * cellHeight + top

    const x2 = x1 + cellWidth
    const y2 = y1

    const x3 = x1
    const y3 = y1 + cellHeight

    position.push(x1)
    position.push(y1)
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
    center.push((x1 + x2 + x3) / 3)
    center.push((y1 + y2 + y3) / 3)
    center.push(0)

    position.push(x2)
    position.push(y2)
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
    center.push((x1 + x2 + x3) / 3)
    center.push((y1 + y2 + y3) / 3)
    center.push(0)

    position.push(x3)
    position.push(y3)
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
    center.push((x1 + x2 + x3) / 3)
    center.push((y1 + y2 + y3) / 3)
    center.push(0)

    const x4 = x2
    const y4 = y1

    const x5 = x4
    const y5 = y4 + cellHeight

    const x6 = x4 - cellWidth
    const y6 = y5

    position.push(x4)
    position.push(y4)
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
    center.push((x4 + x5 + x6) / 3)
    center.push((y4 + y5 + y6) / 3)
    center.push(0)

    position.push(x5)
    position.push(y5)
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
    center.push((x4 + x5 + x6) / 3)
    center.push((y4 + y5 + y6) / 3)
    center.push(0)

    position.push(x6)
    position.push(y6)
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
    center.push((x4 + x5 + x6) / 3)
    center.push((y4 + y5 + y6) / 3)
    center.push(0)
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
  geometry.setAttribute(
    'center',
    new BufferAttribute(new Float32Array(center), 3)
  )

  geometry.setIndex(index)

  console.log(
    new PlaneBufferGeometry(width, height, widthSegment, heightSegment)
  )
  console.log(geometry)

  return geometry
}
