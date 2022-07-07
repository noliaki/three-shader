// =================
// 発散
import { ShaderMaterial, Texture, Vector2, WebGLRenderTarget } from 'three'
import vertexShader from '../common.vert?raw'
import { fragmentShader } from './fragment'

export const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    texPixelRatio: {
      value: 0.4,
    },
    resolution: {
      value: new Vector2(window.innerWidth, window.innerHeight),
    },
    dataTex: {
      value: new Texture(),
    },
  },
})

export const renderTargets: WebGLRenderTarget[] = []
export const renderTarget = new WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
)

renderTargets.push(renderTarget, renderTarget.clone())

let currentRenderIndex = 0

export const update = ({}) => {}

export const swapRenderTarget = () => {
  currentRenderIndex = (currentRenderIndex + 1) % 2
}

export const getTexture = () => renderTargets[currentRenderIndex].texture
