// =================
// 圧力
import { RawShaderMaterial, Texture, Vector2 } from 'three'
import vertexShader from '../common.vert?raw'
import { fragmentShader } from './fragment'
import { texPixelRatio, alpha, beta } from '../config'

export const material = new RawShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    texResolution: {
      value: new Vector2(
        window.innerWidth * texPixelRatio,
        window.innerHeight * texPixelRatio
      ),
    },
    dataTex: { value: new Texture() },
    alpha: { value: alpha },
    beta: { value: beta },
  },
})

export const resize = ({ texResolution }) => {
  material.uniforms.texResolution.value = texResolution
}

export const updateTexture = ({ texture }) => {
  material.uniforms.dataTex.value = texture
}
