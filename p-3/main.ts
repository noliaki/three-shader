import './style.css'
import { WebGLRenderer, OrthographicCamera, Texture } from 'three'
import { debounce } from '../src/utility'

import {
  scene as displayScene,
  mesh as displayMesh,
  updateTexture as updateDisplayTexture,
} from './display'
import { Pane } from 'tweakpane'
import Stats from 'three/examples/jsm/libs/stats.module'

import { getFontTexture } from './font'

import {
  renderTarget as particleRenderTarget,
  getUpdatedTexture as getUpdatedParticleTexture,
} from './particle'

import { getZanzoTexture } from './zanzo'
import { getZanzoTexture as getZanzo2Texture } from './zanzo2'
import { blurRenderTargets, getBlurTexture } from './blur'
// import {
//   updateFontTexture,
//   getUpdatedTexture as getUpdatedMainTexture,
// } from './mix'
import { getTexture as getColorTexture, updateFontTexture } from './color'

const winWidth = window.innerWidth
const winHeight = window.innerHeight

const stats = Stats()

const pane = new Pane()

const startTime = Date.now()
const camera = new OrthographicCamera(
  -winWidth / 2,
  winWidth / 2,
  winHeight / 2,
  -winHeight / 2,
  -1000,
  1000
)

const renderer = new WebGLRenderer()
const bgRenderer = new WebGLRenderer({
  preserveDrawingBuffer: true,
})

let progress = 0

const update = () => {
  const time = Date.now() - startTime
  const colorTexture = getColorTexture({ time, camera, renderer })

  const zanzoTexture = getZanzoTexture({
    renderer,
    nextTexture: colorTexture,
    camera,
    progress,
  })

  // const blurTexture = getBlurTexture({
  //   texture: zanzoTexture,
  //   renderer,
  //   camera,
  // })

  // const updatedParticleTexture = getUpdatedParticleTexture({
  //   renderer,
  //   time,
  //   camera,
  // })

  // const updatedMainTexture = getUpdatedMainTexture({
  //   renderer,
  //   camera,
  //   blurTexture,
  //   particleTexture: updatedParticleTexture,
  // })

  // const uZanzo2Texture = getZanzo2Texture({
  //   renderer,
  //   nextTexture: updatedMainTexture,
  //   camera,
  //   progress,
  //   time,
  // })

  updateDisplayTexture({
    texture: zanzoTexture,
  })

  renderer.setRenderTarget(null)
  renderer.render(displayScene, camera)

  updateFontTexture({ texture: new Texture() })

  stats.update()

  requestAnimationFrame(() => {
    update()
  })
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

const setRenderer = (
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  devicePixelRatio: number = window.devicePixelRatio
): void => {
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(width, height)

  bgRenderer.setSize(width, height)
}

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    setCamera()
    setRenderer()
  })
)

document.body.appendChild(stats.dom)
document.body.appendChild(renderer.domElement)
document.addEventListener(
  'keydown',
  (event: KeyboardEvent): void => {
    if (event.isComposing || event.metaKey || event.altKey || event.ctrlKey) {
      return
    }

    updateFontTexture({ texture: getFontTexture(event.key) })
  },
  {
    passive: true,
  }
)

bgRenderer.setPixelRatio(0.5)

setCamera()
setRenderer()
update()

pane
  .addInput(
    {
      blurR: 10,
    },
    'blurR',
    {
      step: 1,
      min: 1,
      max: 100,
    }
  )
  .on('change', (event) => {
    console.log(event.value)

    blurRenderTargets.forEach((target) => {
      target.updataWeight({
        distance: event.value,
      })
    })
  })
pane
  .addInput(
    {
      vol: 10,
    },
    'vol',
    {
      step: 1,
      min: 10,
      max: 100,
    }
  )
  .on('change', (event) => {
    console.log(event.value)

    blurRenderTargets.forEach((target) => {
      target.updataWeight({
        vol: event.value,
      })
    })
  })
