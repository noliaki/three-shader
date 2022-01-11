import './style.css'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  BufferGeometry,
  BufferAttribute,
  WebGLRenderTarget,
  Points,
  Texture,
  MeshBasicMaterial,
} from 'three'
import { debounce } from '../src/utility'
import vertexShader from './vertex-shader'
import fragmentShader from './fragment-shader'

import blurVertexShader from './vertex-shader/blur.glsl?raw'
import blurFragmentShader from './fragment-shader/blur.glsl?raw'

import resultVertexShader from './vertex-shader/result'
import resultFragmentShader from './fragment-shader/result'

import { zanzoVertexShader } from './vertex-shader/zanzo'
import { zanzoFragmentShader } from './fragment-shader/zanzo'
import { Pane } from 'tweakpane'
import Stats from 'three/examples/jsm/libs/stats.module'

const winWidth = window.innerWidth
const winHeight = window.innerHeight

const stats = Stats()
document.body.appendChild(stats.dom)

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

bgRenderer.setPixelRatio(0.5)

const createGeometry = (
  width: number = window.innerWidth,
  height: number = window.innerHeight
) => {
  const position = []

  for (let i: number = 0; i < 200; i++) {
    position.push(
      Math.random() * -width + width * 0.5,
      Math.random() * -height + height * 0.5,
      0
    )
  }

  const geometry = new BufferGeometry()

  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(position), 3)
  )

  return geometry
}

const point = (() => {
  const renderTarget = new WebGLRenderTarget(winWidth, winHeight)
  const scene = new Scene()
  const geometry = createGeometry()
  const material = new ShaderMaterial({
    uniforms: {
      uTime: {
        value: startTime,
      },
      resolution: {
        value: [1024, 1024],
      },
      uProgress: {
        value: 0,
      },
    },
    vertexShader,
    fragmentShader,
  })

  const points = new Points(geometry, material)

  scene.add(points)

  return {
    renderTarget,
    scene,
    geometry,
    material,
  }
})()

const renderLen = 2
const renderTargets: {
  target: WebGLRenderTarget
  scene: Scene
  geometry: PlaneBufferGeometry
  material: ShaderMaterial
}[] = Array(renderLen)
  .fill('')
  .map((_) => {
    const geometry = new PlaneBufferGeometry(winWidth, winHeight, 1, 1)

    const material = new ShaderMaterial({
      uniforms: {
        uTexture: {
          value: new Texture(),
        },
        uPrevTexture: {
          value: new Texture(),
        },
        uProgress: {
          value: 0,
        },
      },
      vertexShader: zanzoVertexShader,
      fragmentShader: zanzoFragmentShader,
    })

    const mesh = new Mesh(geometry, material)
    const scene = new Scene()
    const target = new WebGLRenderTarget(winWidth, winHeight)

    scene.add(mesh)

    return {
      target,
      scene,
      geometry,
      material,
    }
  })

const blurRenderTargets = new Array(2).fill(0).map((_) => {
  let blurVol = 10
  let defaultDistance = 50

  const calc = (i: number, d: number): number => {
    const r = 1 + 2 * i
    const w = Math.exp((-0.5 * (r * r)) / d)

    return w
  }

  const getWeight = (
    { distance = defaultDistance, vol = blurVol } = {
      distance: defaultDistance,
      vol: blurVol,
    }
  ) => {
    const t = new Array(vol).fill(0).reduce((acc, _curr, i) => {
      const w = calc(i, distance)

      acc += i > 0 ? w * 2 : w

      return acc
    }, 0)

    return new Array(vol).fill(0).map((_, i) => calc(i, distance) / t)
  }

  const updataWeight = ({
    distance,
    vol,
  }: {
    distance?: number
    vol?: number
  }) => {
    defaultDistance = distance ?? defaultDistance
    blurVol = vol ?? blurVol

    material.uniforms.uWeight.value = getWeight({
      distance: defaultDistance,
      vol: blurVol,
    })

    material.uniforms.uBlurTimes.value = blurVol
  }

  const geometry = new PlaneBufferGeometry(
    window.innerWidth,
    window.innerHeight,
    1,
    1
  )
  const material = new ShaderMaterial({
    uniforms: {
      uBlurTexture: {
        value: new Texture(),
      },
      uWeight: {
        value: getWeight(),
      },
      uIsHorizontal: {
        value: false,
      },
      uResolution: {
        value: [window.innerWidth, window.innerHeight],
      },
      uBlurTimes: {
        value: 10,
      },
    },
    vertexShader: blurVertexShader,
    fragmentShader: blurFragmentShader,
  })
  const mesh = new Mesh(geometry, material)
  const scene = new Scene()
  const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight)

  scene.add(mesh)

  return {
    target,
    scene,
    geometry,
    material,
    updataWeight,
  }
})

let currentRenderIndex = 0
let progress = 0

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    setCamera()
    setRenderer()
  })
)

document.body.appendChild(renderer.domElement)

const mainScene = new Scene()
const mainMesh = new Mesh(
  new PlaneBufferGeometry(winWidth, winHeight, 1, 1),
  new ShaderMaterial({
    uniforms: {
      uZanzoTexture: {
        value: blurRenderTargets[1].target.texture,
      },
      uPointTexture: {
        value: point.renderTarget.texture,
      },
    },
    vertexShader: resultVertexShader,
    fragmentShader: resultFragmentShader,
  })
)

const getBlurTexture = (inputTexture: Texture): Texture => {
  blurRenderTargets.forEach(
    (
      { material: blurMaterial, scene: blurScene, target: blurRenderTarget },
      i
    ) => {
      const isHorizontal = i === 0
      const texture = isHorizontal
        ? inputTexture
        : blurRenderTargets[0].target.texture

      blurMaterial.uniforms.uIsHorizontal.value = isHorizontal
      blurMaterial.uniforms.uBlurTexture.value = texture

      renderer.setRenderTarget(blurRenderTarget)
      renderer.render(blurScene, camera)
    }
  )

  return blurRenderTargets[1].target.texture
}

const update = () => {
  const time = Date.now() - startTime

  const nextRenderIndex = (currentRenderIndex + 1) % renderLen

  const { target: currentTarget } = renderTargets[currentRenderIndex]

  const {
    scene: nextScene,
    target: nextTarget,
    material: nextMaterial,
  } = renderTargets[nextRenderIndex]

  const {
    material: pointMaterial,
    renderTarget: pointRenderTarget,
    scene: pointScene,
  } = point

  nextMaterial.uniforms.uPrevTexture.value = currentTarget.texture
  nextMaterial.uniforms.uTexture.value = pointRenderTarget.texture
  nextMaterial.uniforms.uProgress.value = progress

  renderer.setRenderTarget(nextTarget)
  renderer.render(nextScene, camera)

  const blurTexture = getBlurTexture(nextTarget.texture)

  pointMaterial.uniforms.uTime.value = time
  renderer.setRenderTarget(pointRenderTarget)
  renderer.render(pointScene, camera)

  mainMesh.material.uniforms.uZanzoTexture.value = blurTexture
  mainMesh.material.uniforms.uPointTexture.value = pointRenderTarget.texture

  renderer.setRenderTarget(null)
  renderer.render(mainScene, camera)

  currentRenderIndex = nextRenderIndex

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

function setRenderer(
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  devicePixelRatio: number = window.devicePixelRatio
): void {
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(width, height)

  bgRenderer.setSize(width, height)
}

mainScene.add(mainMesh)

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
