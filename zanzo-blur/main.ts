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
} from 'three'
import { debounce } from '../src/utility'
import vertexShader from './vertex-shader'
import fragmentShader from './fragment-shader'

const distance = 10

const t = new Array(10).fill(0).reduce((acc, _curr, i) => {
  const r = 1 + 2 * i
  const w = Math.exp((-0.5 * (r * r)) / distance)

  acc += i > 0 ? w * 2 : w

  return acc
}, 0)

const weight = new Array(10).fill(0).map((_, i) => {
  const r = 1 + 2 * i

  return Math.exp((-0.5 * (r * r)) / distance) / t
})

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
          // value: renderTargets[currentRenderIndex].target.texture,
        },
        uPrevTexture: {
          value: new Texture(),
          // value: renderTargets[currentRenderIndex].target.texture,
        },
        uProgress: {
          value: 0,
        },
      },
      vertexShader: `
uniform sampler2D uTexture;
varying vec2 vUv;

void main(void) {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
      fragmentShader: `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uPrevTexture;
uniform float uProgress;

void main(void) {
  vec4 prevColor = texture2D(uPrevTexture, vUv) - 0.006;
  vec4 color = texture2D(uTexture, vUv);

  gl_FragColor = prevColor.a > color.a ? prevColor : color;
}
    `,
    })
    const mesh = new Mesh(geometry, material)
    const scene = new Scene()
    const target = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
      // {
      //   depthBuffer: false,
      //   stencilBuffer: false,
      //   // magFilter: NearestFilter,
      //   // minFilter: NearestFilter,
      //   // wrapS: ClampToEdgeWrapping,
      // }
    )

    scene.add(mesh)

    return {
      target,
      scene,
      geometry,
      material,
    }
  })

const blurRenderTargets = new Array(2).fill(0).map((_) => {
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
        // value: renderTargets[currentRenderIndex].target.texture,
      },
      uWeight: {
        value: weight,
        // value: renderTargets[currentRenderIndex].target.texture,
      },
      uIsHorizontal: {
        value: false,
      },
      uResolution: {
        value: [window.innerWidth, window.innerHeight],
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
uniform float uWeight[10];
uniform vec2 uResolution;

// const float[10] weights = float[](0.9646517207363228, 0.017668212570402537, 0.000005927025019207429, 3.641690034149965, 4.0981822426645104, 8.446983174881328, 3.188849797843883, 2.204898338322799, 2.792319757544259, 6.476849426964096);

void main(void) {
  vec2 tFrag = 1.0 / uResolution;
  vec2 fc;
  vec3 destColor = vec3(0.0);

  if (uIsHorizontal) {
    fc = vec2(gl_FragCoord.s, gl_FragCoord.t);
    destColor += texture2D(uBlurTexture, (fc + vec2(-9.0, 0.0)) * tFrag).rgb * uWeight[9];
    destColor += texture2D(uBlurTexture, (fc + vec2(-8.0, 0.0)) * tFrag).rgb * uWeight[8];
    destColor += texture2D(uBlurTexture, (fc + vec2(-7.0, 0.0)) * tFrag).rgb * uWeight[7];
    destColor += texture2D(uBlurTexture, (fc + vec2(-6.0, 0.0)) * tFrag).rgb * uWeight[6];
    destColor += texture2D(uBlurTexture, (fc + vec2(-5.0, 0.0)) * tFrag).rgb * uWeight[5];
    destColor += texture2D(uBlurTexture, (fc + vec2(-4.0, 0.0)) * tFrag).rgb * uWeight[4];
    destColor += texture2D(uBlurTexture, (fc + vec2(-3.0, 0.0)) * tFrag).rgb * uWeight[3];
    destColor += texture2D(uBlurTexture, (fc + vec2(-2.0, 0.0)) * tFrag).rgb * uWeight[2];
    destColor += texture2D(uBlurTexture, (fc + vec2(-1.0, 0.0)) * tFrag).rgb * uWeight[1];
    destColor += texture2D(uBlurTexture, (fc + vec2( 0.0, 0.0)) * tFrag).rgb * uWeight[0];
    destColor += texture2D(uBlurTexture, (fc + vec2( 1.0, 0.0)) * tFrag).rgb * uWeight[1];
    destColor += texture2D(uBlurTexture, (fc + vec2( 2.0, 0.0)) * tFrag).rgb * uWeight[2];
    destColor += texture2D(uBlurTexture, (fc + vec2( 3.0, 0.0)) * tFrag).rgb * uWeight[3];
    destColor += texture2D(uBlurTexture, (fc + vec2( 4.0, 0.0)) * tFrag).rgb * uWeight[4];
    destColor += texture2D(uBlurTexture, (fc + vec2( 5.0, 0.0)) * tFrag).rgb * uWeight[5];
    destColor += texture2D(uBlurTexture, (fc + vec2( 6.0, 0.0)) * tFrag).rgb * uWeight[6];
    destColor += texture2D(uBlurTexture, (fc + vec2( 7.0, 0.0)) * tFrag).rgb * uWeight[7];
    destColor += texture2D(uBlurTexture, (fc + vec2( 8.0, 0.0)) * tFrag).rgb * uWeight[8];
    destColor += texture2D(uBlurTexture, (fc + vec2( 9.0, 0.0)) * tFrag).rgb * uWeight[9];
  } else {
    fc = gl_FragCoord.st;
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -9.0)) * tFrag).rgb * uWeight[9];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -8.0)) * tFrag).rgb * uWeight[8];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -7.0)) * tFrag).rgb * uWeight[7];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -6.0)) * tFrag).rgb * uWeight[6];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -5.0)) * tFrag).rgb * uWeight[5];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -4.0)) * tFrag).rgb * uWeight[4];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -3.0)) * tFrag).rgb * uWeight[3];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -2.0)) * tFrag).rgb * uWeight[2];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0, -1.0)) * tFrag).rgb * uWeight[1];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  0.0)) * tFrag).rgb * uWeight[0];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  1.0)) * tFrag).rgb * uWeight[1];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  2.0)) * tFrag).rgb * uWeight[2];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  3.0)) * tFrag).rgb * uWeight[3];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  4.0)) * tFrag).rgb * uWeight[4];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  5.0)) * tFrag).rgb * uWeight[5];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  6.0)) * tFrag).rgb * uWeight[6];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  7.0)) * tFrag).rgb * uWeight[7];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  8.0)) * tFrag).rgb * uWeight[8];
    destColor += texture2D(uBlurTexture, (fc + vec2(0.0,  9.0)) * tFrag).rgb * uWeight[9];
  }

  gl_FragColor = vec4(destColor, 1.0);
}
    `,
  })
  const mesh = new Mesh(geometry, material)
  const scene = new Scene()
  const target = new WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
    // {
    //   depthBuffer: false,
    //   stencilBuffer: false,
    //   // magFilter: NearestFilter,
    //   // minFilter: NearestFilter,
    //   // wrapS: ClampToEdgeWrapping,
    // }
  )

  scene.add(mesh)

  return {
    target,
    scene,
    geometry,
    material,
  }
})

let currentRenderIndex = 0
let progress = 0

window.addEventListener(
  'resize',
  debounce((_event: Event): void => {
    // points.geometry = createGeometry()

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

const mainScene = new Scene()
const mainMesh = new Mesh(
  new PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1, 1),
  new ShaderMaterial({
    uniforms: {
      uResultTexture: {
        value: point.renderTarget.texture,
      },
    },
    vertexShader: `
varying vec2 vUv;

void main(void) {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
    fragmentShader: `
varying vec2 vUv;
uniform sampler2D uResultTexture;

void main(void) {

  gl_FragColor = texture2D(uResultTexture, vUv);
}
    `,
  })
)

mainScene.add(mainMesh)

setCamera()
setRenderer()
update()

function update(): void {
  const {
    material: pointMaterial,
    renderTarget: pointRenderTarget,
    scene: pointScene,
  } = point

  pointMaterial.uniforms.uTime.value = Date.now() - startTime

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

  mainMesh.material.uniforms.uResultTexture.value = nextTarget.texture
  // mainMesh.material.uniforms.uResultTexture.value = pointRenderTarget.texture
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
