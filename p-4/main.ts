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
import { texPixelRatio } from './config'
import {
  getRenderTexture,
  swap as swapRenderTeture,
  setMaterial,
  update as updateRenderTexture,
  resize as resizeRenderTexture,
} from './renderTexture'
import { solverIteration } from './config'
import { material as divergenceMaterial } from './divergence'
import { material as presserMaterial } from './presser'
import { material as velocityMaterial } from './velocity'
import { material as advectMaterial } from './advect'

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
const renderer = new WebGLRenderer({
  alpha: true,
})

const update = () => {
  const time = Date.now() - start

  // -----------------------
  // divergence
  divergenceMaterial.uniforms.dataTex.value = getRenderTexture()
  divergenceMaterial.needsUpdate = true
  swapRenderTeture()
  setMaterial(divergenceMaterial)
  updateRenderTexture({ renderer, camera })

  // -----------------------
  // presser
  for (let i = 0; i < solverIteration; i++) {
    presserMaterial.uniforms.dataTex.value = getRenderTexture()
    presserMaterial.needsUpdate = true
    swapRenderTeture()
    setMaterial(presserMaterial)
    updateRenderTexture({ renderer, camera })
  }

  // -----------------------
  // velocity
  velocityMaterial.uniforms.time.value = time
  velocityMaterial.uniforms.pointerPos.value = new Vector2(
    mousePoint.x,
    mousePoint.y
  )
  velocityMaterial.uniforms.beforePointerPos.value = new Vector2(
    prevMousePoint.x,
    prevMousePoint.y
  )
  velocityMaterial.needsUpdate = true
  swapRenderTeture()
  setMaterial(velocityMaterial)
  updateRenderTexture({ renderer, camera })

  // -----------------------
  // advect
  advectMaterial.uniforms.dataTex.value = getRenderTexture()
  advectMaterial.needsUpdate = true
  swapRenderTeture()
  setMaterial(advectMaterial)
  updateRenderTexture({ renderer, camera })

  const { material } = mesh
  material.uniforms.dataTex.value = getRenderTexture()
  material.uniforms.time.value = time
  material.needsUpdate = true

  swapRenderTeture()
  renderer.setRenderTarget(null)
  renderer.render(scene, camera)

  prevMousePoint.x = mousePoint.x
  prevMousePoint.y = mousePoint.y

  requestAnimationFrame(update)
}

const setRenderer = (
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  devicePixelRatio: number = window.devicePixelRatio
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

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    const r = new Vector2(window.innerWidth, window.innerHeight)
    divergenceMaterial.uniforms.resolution.value = r
    presserMaterial.uniforms.resolution.value = r
    velocityMaterial.uniforms.resolution.value = r
    advectMaterial.uniforms.resolution.value = r

    mesh.material.uniforms.resolution.value = r

    setCamera()
    setRenderer()
    resizeRenderTexture()
  })
)

setRenderer()
scene.add(mesh)
document.body.appendChild(renderer.domElement)

window.dispatchEvent(new Event('resize'))

update()
