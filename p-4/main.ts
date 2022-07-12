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
import { texPixelRatio, devicePixelRatio } from './config'
import {
  getRenderTexture,
  swap as swapRenderTeture,
  setMaterial,
  render as renderRenderTexture,
  resize as resizeRenderTexture,
} from './renderTexture'
import { solverIteration } from './config'
import { material as divergenceMaterial } from './divergence'
import { material as presserMaterial } from './presser'
import { material as velocityMaterial } from './velocity'
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

const textureMesh = new Mesh(
  new PlaneBufferGeometry(100, 100, 1, 1),
  new RawShaderMaterial({
    vertexShader,
    fragmentShader: `
precision highp float;

uniform sampler2D dataTex;
uniform vec2 resolution;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  gl_FragColor = texture2D(dataTex, uv);
}
    `,
    uniforms: {
      dataTex: {
        value: new Texture(),
      },
      resolution: {
        value: new Vector2(winWidth, winHeight),
      },
    },
  })
)

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
const renderer = new WebGLRenderer({
  alpha: true,
})

const update = () => {
  const time = Date.now() - start

  // -----------------------
  // divergence
  divergenceMaterial.uniforms.dataTex.value = getRenderTexture()
  divergenceMaterial.needsUpdate = true
  setMaterial(divergenceMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // presser
  for (let i = 0; i < solverIteration; i++) {
    presserMaterial.uniforms.dataTex.value = getRenderTexture()
    presserMaterial.needsUpdate = true
    setMaterial(presserMaterial)
    swapRenderTeture()
    renderRenderTexture({ renderer, camera })
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
  setMaterial(velocityMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // advect
  advectMaterial.uniforms.dataTex.value = getRenderTexture()
  advectMaterial.needsUpdate = true
  setMaterial(advectMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // main
  const { material } = mesh
  material.uniforms.dataTex.value = getRenderTexture()
  material.uniforms.time.value = time
  material.needsUpdate = true

  textureMesh.material.uniforms.dataTex.value = getRenderTexture()
  textureMesh.material.needsUpdate = true

  renderer.setRenderTarget(null)
  renderer.render(scene, camera)

  prevMousePoint.x = mousePoint.x
  prevMousePoint.y = mousePoint.y

  swapRenderTeture()
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

scene.add(mesh)
scene.add(textureMesh)
document.body.appendChild(stats.domElement)
document.body.appendChild(renderer.domElement)

window.dispatchEvent(new Event('resize'))

update()
