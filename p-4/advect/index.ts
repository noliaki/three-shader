// =================
// 移流
import { RawShaderMaterial, Texture, Vector2, WebGLRenderTarget } from 'three'
import vertexShader from '../common.vert?raw'
import { fragmentShader } from './fragment'
import { texPixelRatio, attenuation } from '../config'

export const material = new RawShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    dataTex: { value: new Texture() },
    attenuation: { value: attenuation }, // 減衰,
    texResolution: {
      value: new Vector2(
        window.innerWidth * texPixelRatio,
        window.innerHeight * texPixelRatio
      ),
    },
  },
})

export const resize = ({ texResolution }) => {
  material.uniforms.texResolution.value = texResolution
}

export const updateTexture = ({ texture }) => {
  material.uniforms.dataTex.value = texture
}
