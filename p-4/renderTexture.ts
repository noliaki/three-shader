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

export const mesh = new Mesh(new PlaneBufferGeometry(100, 100))

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
export const getRenderTexture = () => getRendertarget().texture
export const swap = () => (currentIndex = (currentIndex + 1) % 2)
export const setMaterial = (material: RawShaderMaterial): Mesh => {
  mesh.material = material
  mesh.material.needsUpdate = true

  return mesh
}
export const update = ({ renderer, camera }) => {
  renderer.setRenderTarget(getRendertarget())
  renderer.render(scene, camera)
  renderer.setRenderTarget(null)
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
