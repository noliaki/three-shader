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
  TextureLoader,
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
  updateTextTex,
} from './velocity'
import {
  material as advectMaterial,
  resize as resizeAdvect,
  updateTexture as updateAdvectTexture,
} from './advect'
import Stats from 'three/examples/jsm/libs/stats.module'
import { getFontTexture, resize as fontTexResize } from './font'

const stats = Stats()

// const mousePoint = {
//   x: 0,
//   y: 0,
// }
// const prevMousePoint = {
//   x: 0,
//   y: 0,
// }

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
      dataTex: { value: new Texture() },
      resolution: { value: new Vector2(winWidth, winHeight) },
      devicePixelRatio: { value: devicePixelRatio },
      texResolution: {
        value: new Vector2(winWidth * texPixelRatio, winHeight * texPixelRatio),
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
    // pointerPos: new Vector2(
    //   mousePoint.x * texPixelRatio,
    //   mousePoint.y * texPixelRatio
    // ),
    // beforePointerPos: new Vector2(
    //   prevMousePoint.x * texPixelRatio,
    //   prevMousePoint.y * texPixelRatio
    // ),
    dataTex: getRenderTexture(),
  })
  setMaterial(velocityMaterial)
  swapRenderTeture()
  renderRenderTexture({ renderer, camera })

  // -----------------------
  // advect
  updateAdvectTexture({
    texture: getRenderTexture(),
  })
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

  // prevMousePoint.x = mousePoint.x
  // prevMousePoint.y = mousePoint.y

  updateTextTex({ texture: new Texture() })
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
  resizeAdvect({
    texResolution: tr,
  })

  mesh.material.uniforms.resolution.value = new Vector2(
    window.innerWidth,
    window.innerHeight
  )
  mesh.material.uniforms.texResolution.value = tr

  fontTexResize()
  setCamera()
  setRenderer()
  resizeRenderTexture()
}

document.addEventListener(
  'keydown',
  (event: KeyboardEvent): void => {
    if (
      event.isComposing ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return
    }

    const texture = getFontTexture(event.key)

    updateTextTex({ texture })
  },
  {
    passive: true,
  }
)

document.querySelector('input')?.addEventListener(
  'input',
  (event: Event): void => {
    const el = event.currentTarget

    if (!(el instanceof HTMLInputElement)) {
      return
    }

    const texture = getFontTexture(el.value)

    updateTextTex({ texture })

    el.value = ''
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

// new TextureLoader().load('/p-5/DSC00135.JPG', (texture) => {
//   const { material } = mesh

//   material.uniforms.imageTex.value = texture
//   material.uniforms.imageResolution.value = new Vector2(
//     texture.image.naturalWidth,
//     texture.image.naturalHeight
//   )
// })

onWinResize()
update()
