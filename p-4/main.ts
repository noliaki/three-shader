import './style.css'
import {
  WebGLRenderer,
  OrthographicCamera,
  Texture,
  RawShaderMaterial,
  Vector2,
  PlaneBufferGeometry,
  Mesh,
  Scene,
} from 'three'
import { debounce } from '../src/utility'

import vertexShader from './common.vert?raw'
import { fragmentShader } from './fragment'
import { texPixelRatio, devicePixelRatio, solverIteration } from './config'
import {
  getRenderTexture,
  swap as swapRenderTeture,
  setMaterial,
  render as renderRenderTexture,
  resize as resizeRenderTexture,
} from './renderTexture'
import {
  material as divergenceMaterial,
  resize as resizeDivergence,
  updateTexture as updateDivergenceTexture,
} from './divergence'
import {
  material as presserMaterial,
  resize as resizePresser,
  updateTexture as updatePresserTexture,
} from './presser'
import {
  material as velocityMaterial,
  update as updateVelocity,
  resize as resizeVelocity,
} from './velocity'
import { material as advectMaterial } from './advect'
import Stats from 'three/examples/jsm/libs/stats.module'

const stats = Stats()

const mousePoint = {
  x: 0,
  y: 0,
}
const prevMousePoint = {
  x: 0,
  y: 0,
}

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
      texPixelRatio: { value: texPixelRatio },
      dataTex: { value: new Texture() },
      resolution: { value: new Vector2(winWidth, winHeight) },
      devicePixelRatio: { value: devicePixelRatio },
    },
  })
)

const scene = new Scene()
const camera = new OrthographicCamera(
  -winWidth * 0.5,
  winWidth * 0.5,
  winHeight * 0.5,
  -winHeight * 0.5,
  -100,
  100
)
camera.position.z = 10
camera.lookAt(0, 0, 0)
const renderer = new WebGLRenderer({
  alpha: true,
  preserveDrawingBuffer: true,
})

const update = () => {
  const time = Date.now() - start

  // -----------------------
  // divergence
  updateDivergenceTexture({
    texture: getRenderTexture(),
  })
  setMaterial(divergenceMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // presser
  for (let i = 0; i < solverIteration; i++) {
    updatePresserTexture({
      texture: getRenderTexture(),
    })
    setMaterial(presserMaterial)
    swapRenderTeture()
    renderRenderTexture({ renderer, camera })
  }

  // -----------------------
  // velocity
  updateVelocity({
    time,
    pointerPos: new Vector2(
      mousePoint.x * texPixelRatio,
      mousePoint.y * texPixelRatio
    ),
    beforePointerPos: new Vector2(
      prevMousePoint.x * texPixelRatio,
      prevMousePoint.y * texPixelRatio
    ),
    dataTex: getRenderTexture(),
  })
  // velocityMaterial.uniforms.time.value = time
  // velocityMaterial.uniforms.pointerPos.value = new Vector2(
  //   mousePoint.x,
  //   mousePoint.y
  // )
  // velocityMaterial.uniforms.beforePointerPos.value = new Vector2(
  //   prevMousePoint.x,
  //   prevMousePoint.y
  // )
  // velocityMaterial.uniforms.dataTex.value = getRenderTexture()
  setMaterial(velocityMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // advect
  advectMaterial.uniforms.dataTex.value = getRenderTexture()
  setMaterial(advectMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // main
  const { material } = mesh
  material.uniforms.dataTex.value = getRenderTexture()
  material.uniforms.time.value = time

  renderer.setRenderTarget(null)
  renderer.render(scene, camera)

  prevMousePoint.x = mousePoint.x
  prevMousePoint.y = mousePoint.y

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
  const r = new Vector2(window.innerWidth, window.innerHeight)
  const tr = new Vector2(
    window.innerWidth * texPixelRatio,
    window.innerHeight * texPixelRatio
  )

  resizeDivergence({
    texResolution: tr,
  })
  resizePresser({
    texResolution: tr,
  })
  resizeVelocity({
    texResolution: tr,
  })
  // velocityMaterial.uniforms.resolution.value = r
  advectMaterial.uniforms.resolution.value = r
  mesh.material.uniforms.resolution.value = r

  setCamera()
  setRenderer()
  resizeRenderTexture()
}

window.addEventListener(
  'mousemove',
  (event: MouseEvent): void => {
    mousePoint.x = event.clientX
    mousePoint.y = event.clientY
  },
  {
    passive: true,
  }
)

window.addEventListener('resize', debounce(onWinResize))

renderer.setPixelRatio(devicePixelRatio)
scene.add(mesh)
document.body.appendChild(stats.domElement)
document.body.appendChild(renderer.domElement)

onWinResize()

renderRenderTexture({ renderer, camera })
swapRenderTeture()
renderRenderTexture({ renderer, camera })

update()
