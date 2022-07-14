import {
  PlaneBufferGeometry,
  Mesh,
  Scene,
  WebGLRenderTarget,
  NearestFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  FloatType,
  RawShaderMaterial,
} from 'three'
import { texPixelRatio } from './config'
import vertexShader from './common.vert?raw'

let currentIndex = 0
const texW = window.innerWidth * texPixelRatio
const texH = window.innerHeight * texPixelRatio

export const mesh = new Mesh(
  new PlaneBufferGeometry(texW, texH),
  new RawShaderMaterial({
    vertexShader,
    fragmentShader: `precision mediump float;
void main(){
  gl_FragColor = vec4(0.0);
}`,
    depthTest: false,
    depthWrite: false,
  })
)
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
export const getRenderTexture = () => getRendertarget().texture
export const swap = () => (currentIndex = (currentIndex + 1) % 2)
export const setMaterial = (material: RawShaderMaterial): void => {
  mesh.material = material
  mesh.material.needsUpdate = true
}
export const render = ({ renderer, camera }) => {
  renderer.setRenderTarget(getRendertarget())
  renderer.render(scene, camera)
}

export const resize = ({
  width = window.innerWidth * texPixelRatio,
  height = window.innerHeight * texPixelRatio,
} = {}) => {
  renderTargets.forEach((renderTarget) => {
    renderTarget.setSize(width, height)
  })
}

renderTargets.forEach((renderTarget) => {
  renderTarget.texture.flipY = false
})

scene.add(mesh)
