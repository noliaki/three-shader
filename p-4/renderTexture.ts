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

let currentIndex = 0
const texW = 100 //window.innerWidth * texPixelRatio
const texH = 100 //window.innerHeight * texPixelRatio

export const mesh = new Mesh(new PlaneBufferGeometry(texW, texH, 1, 1))

export const scene = new Scene()
const renderTargets = [...new Array(2)].map((_) => {
  const rt = new WebGLRenderTarget(texW, texH, {
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

  rt.texture.flipY = false

  return rt
})

export const getRendertarget = () => renderTargets[currentIndex]
export const getRenderTexture = () => getRendertarget().texture
export const swap = () => (currentIndex = (currentIndex + 1) % 2)
export const setMaterial = (material: RawShaderMaterial): void => {
  mesh.material = material
}
export const render = ({ renderer, camera }) => {
  renderer.setRenderTarget(getRendertarget())
  renderer.render(scene, camera)
}

export const resize = ({
  width = Math.round(window.innerWidth * texPixelRatio),
  height = Math.round(window.innerHeight * texPixelRatio),
} = {}) => {
  // mesh.geometry = new PlaneBufferGeometry(width, height, 1, 1)
  renderTargets.forEach((renderTarget) => {
    renderTarget.setSize(width, height)
  })
}

scene.add(mesh)
