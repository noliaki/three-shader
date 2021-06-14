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
  widthSegment: number = Math.floor(window.innerWidth / 120),
  heightSegment: number = Math.floor(window.innerHeight / 130)
): BufferGeometry {
  const segments = widthSegment * heightSegment

  const top = height / 2
  const left = -(width / 2)

  const cellWidth = width / widthSegment
  const cellHeight = height / heightSegment

  const position = []
  const index = []
  const uv = []

  for (let i: number = 0; i < segments; i++) {
    const row = Math.floor(i / heightSegment)
    const col = i % widthSegment

    position.push(col * cellWidth)
    position.push(row * cellHeight)
    position.push(0)

    position.push((col + 1) * cellWidth)
    position.push(row * cellHeight)
    position.push(0)

    position.push(col * cellWidth)
    position.push((row + 1) * cellHeight)
    position.push(0)

    position.push((col + 1) * cellWidth)
    position.push(row * cellHeight)
    position.push(0)

    position.push((col + 1) * cellWidth)
    position.push((row + 1) * cellHeight)
    position.push(0)

    position.push(col * cellWidth)
    position.push((row + 1) * cellHeight)
    position.push(0)

    index.push(i * 3 + 0)
    index.push(i * 3 + 1)
    index.push(i * 3 + 2)

    index.push(i * 3 + 3)
    index.push(i * 3 + 4)
    index.push(i * 3 + 5)
  }

  const planeGeometry = new PlaneBufferGeometry(
    width,
    height,
    widthSegment,
    heightSegment
  )
  const geometry = new BufferGeometry()

  geometry.setAttribute(
    'position',
    new BufferAttribute(
      planeGeometry.attributes.position.array,
      planeGeometry.attributes.position.itemSize
    )
  )
  geometry.setAttribute(
    'uv',
    new BufferAttribute(
      planeGeometry.attributes.uv.array,
      planeGeometry.attributes.uv.itemSize
    )
  )
  geometry.setAttribute(
    'normal',
    new BufferAttribute(
      planeGeometry.attributes.normal.array,
      planeGeometry.attributes.normal.itemSize
    )
  )

  geometry.setIndex(
    new BufferAttribute(
      new Uint16Array(
        Array.from(
          Array(planeGeometry.attributes.position.array.length / 3)
        ).map((_, index: number): number => index)
      ),
      1
    )
  )

  console.log(planeGeometry)
  console.log(geometry)

  return geometry
}
