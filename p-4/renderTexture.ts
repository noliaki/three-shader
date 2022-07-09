import {
  PlaneBufferGeometry,
  Mesh,
  Scene,
  WebGLRenderTarget,
  NearestFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  FloatType,
  WebGLRenderer,
  OrthographicCamera,
} from 'three'

export const mesh = new Mesh(
  new PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1, 1)
)

let currentIndex = 0
const texW = 100
const texH = 100

export const scene = new Scene()
const renderTarget = new WebGLRenderTarget(texW, texH, {
  magFilter: NearestFilter,
  minFilter: NearestFilter,
  wrapS: ClampToEdgeWrapping,
  wrapT: ClampToEdgeWrapping,
  format: RGBAFormat,
  type: FloatType,
  depthBuffer: false,
  stencilBuffer: false,
  generateMipmaps: false,
})
const renderTargets = [renderTarget, renderTarget.clone()]

export const getRendertarget = () => renderTargets[currentIndex]
export const swap = () => (currentIndex = (currentIndex + 1) % 2)

scene.add(mesh)
