import './style.css'
import {
  WebGLRenderer,
  OrthographicCamera,
  RawShaderMaterial,
  Vector2,
  PlaneBufferGeometry,
  Mesh,
  Scene,
} from 'three'
import { debounce } from '../src/utility'

import { vertexShader } from './vertex-shader'
import { fragmentShader } from './fragment-shader'
import Stats from 'three/examples/jsm/libs/stats.module'

const stats = Stats()

const start = Date.now()
const winWidth = window.innerWidth
const winHeight = window.innerHeight

const mesh = new Mesh(
  new PlaneBufferGeometry(winWidth, winHeight, 1, 1),
  new RawShaderMaterial({
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      devicePixelRatio: { value: devicePixelRatio },
      resolution: {
        value: [winWidth, winHeight],
      },
    },
  })
)

const scene = new Scene()
const camera = new OrthographicCamera(
  -winWidth * 0.5,
  winWidth * 0.5,
  winHeight * 0.5,
  -winHeight * 0.5,
  0,
  0
)
const renderer = new WebGLRenderer({
  // alpha: true,
  // preserveDrawingBuffer: false,
})

const update = () => {
  const time = Date.now() - start

  // -----------------------
  // main
  const { material } = mesh
  material.uniforms.time.value = time

  renderer.setRenderTarget(null)
  renderer.render(scene, camera)

  stats.update()

  requestAnimationFrame(update)
}

const setRenderer = (
  width: number = window.innerWidth,
  height: number = window.innerHeight
): void => {
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(width, height)
}

const setCamera = (
  width: number = window.innerWidth,
  height: number = window.innerHeight
) => {
  const halfW = width / 2
  const halfH = height / 2

  camera.left = -halfW
  camera.right = halfW
  camera.top = halfH
  camera.bottom = -halfH

  camera.updateProjectionMatrix()
}

const onWinResize = (_event?: Event): void => {
  mesh.material.uniforms.resolution.value = new Vector2(
    window.innerWidth,
    window.innerHeight
  )

  setCamera()
  setRenderer()
}

window.addEventListener('resize', debounce(onWinResize))

renderer.setPixelRatio(devicePixelRatio)
scene.add(mesh)
document.body.appendChild(stats.domElement)
document.body.appendChild(renderer.domElement)

onWinResize()
update()
