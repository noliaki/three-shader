import './style.css'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  TextureLoader,
  BufferGeometry,
  BufferAttribute,
  DoubleSide,
  SphereGeometry,
  MeshNormalMaterial,
  WebGLRenderTarget,
  PointsMaterial,
  Points,
  MeshBasicMaterial,
  NearestFilter,
  ClampToEdgeWrapping,
  Texture,
  MeshStandardMaterial,
} from 'three'
import { debounce } from '../src/utility'
import vertexShader from './vertex-shader'
import fragmentShader from './fragment-shader'

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
      progress: {
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

void main(void) {
  vec4 prevColor = texture2D(uPrevTexture, vUv) - 0.005;

  vec4 color = texture2D(uTexture, vUv);

  gl_FragColor = prevColor.a > color.a ? prevColor : color;
  // gl_FragColor = (prevColor + color);
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

  renderer.setRenderTarget(nextTarget)
  nextMaterial.uniforms.uPrevTexture.value = currentTarget.texture
  nextMaterial.uniforms.uTexture.value = pointRenderTarget.texture
  renderer.render(nextScene, camera)

  renderer.setRenderTarget(null)
  mainMesh.material.uniforms.uResultTexture.value = nextTarget.texture
  // mainMesh.material.uniforms.uResultTexture.value = pointRenderTarget.texture
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
