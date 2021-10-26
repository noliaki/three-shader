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

import resultVertexShader from './vertex-shader/result'
import resultFragmentShader from './fragment-shader/result'

import { zanzoVertexShader } from './vertex-shader/zanzo'
import { zanzoFragmentShader } from './fragment-shader/zanzo'
import { Pane } from 'tweakpane'

const pane = new Pane()

const startTime = Date.now()
const camera = new OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  -window.innerHeight / 2,
  -1000,
  1000
)
const renderer = new WebGLRenderer({})

const point = (() => {
  const renderTarget = new WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
  )
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
    const geometry = new PlaneBufferGeometry(
      window.innerWidth,
      window.innerHeight,
      1,
      1
    )
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
    const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight)

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
    vertexShader: `
void main(void) {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
    fragmentShader: `
uniform bool uIsHorizontal;
uniform sampler2D uBlurTexture;
uniform float uWeight[100];
uniform vec2 uResolution;
uniform int uBlurTimes;

void main(void) {
  vec2 tFrag = 1.0 / uResolution;
  vec2 fc = gl_FragCoord.xy;
  vec3 destColor = texture2D(uBlurTexture, fc * tFrag).rgb * uWeight[0];

  for (int i = 1; i < 10; i++) {
    vec2 dfc = uIsHorizontal ? vec2(float(i), 0.0) : vec2(0.0, float(i));

    destColor += texture2D(uBlurTexture, (fc + dfc) * tFrag).rgb * uWeight[i];
    destColor += texture2D(uBlurTexture, (fc + dfc * -1.0) * tFrag).rgb * uWeight[i];
  }

  gl_FragColor = vec4(destColor, 1.0);
}
    `,
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
  new PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1, 1),
  new ShaderMaterial({
    uniforms: {
      uZanzoTexture: {
        value: point.renderTarget.texture,
      },
    },
    vertexShader: resultVertexShader,
    fragmentShader: resultFragmentShader,
  })
)

const pointMesh = new Mesh(
  new PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1, 1),
  new MeshBasicMaterial({
    map: point.renderTarget.texture,
    transparent: true,
  })
)

mainScene.add(mainMesh)
mainScene.add(pointMesh)

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

function update(): void {
  const time = Date.now() - startTime
  const {
    material: pointMaterial,
    renderTarget: pointRenderTarget,
    scene: pointScene,
  } = point

  pointMaterial.uniforms.uTime.value = time
  renderer.setRenderTarget(pointRenderTarget)
  renderer.render(pointScene, camera)

  const nextRenderIndex = (currentRenderIndex + 1) % renderLen

  const {
    scene: nextScene,
    target: nextTarget,
    material: nextMaterial,
  } = renderTargets[nextRenderIndex]

  const { target: currentTarget } = renderTargets[currentRenderIndex]

  blurRenderTargets.forEach(
    (
      { material: blurMaterial, scene: blurScene, target: blurRenderTarget },
      i
    ) => {
      const isHorizontal = i === 0
      const texture = isHorizontal
        ? currentTarget.texture
        : blurRenderTargets[0].target.texture

      blurMaterial.uniforms.uIsHorizontal.value = isHorizontal
      blurMaterial.uniforms.uBlurTexture.value = texture

      renderer.setRenderTarget(blurRenderTarget)
      renderer.render(blurScene, camera)
    }
  )

  nextMaterial.uniforms.uPrevTexture.value = blurRenderTargets[1].target.texture
  nextMaterial.uniforms.uTexture.value = pointRenderTarget.texture
  nextMaterial.uniforms.uProgress.value = progress

  renderer.setRenderTarget(nextTarget)
  renderer.render(nextScene, camera)

  mainMesh.material.uniforms.uZanzoTexture.value = nextTarget.texture

  renderer.setRenderTarget(null)
  renderer.render(mainScene, camera)

  currentRenderIndex = nextRenderIndex

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
}

function createGeometry(
  width: number = window.innerWidth,
  height: number = window.innerHeight
): BufferGeometry {
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
