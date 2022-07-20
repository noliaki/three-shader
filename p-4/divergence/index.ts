// =================
// 発散
import { RawShaderMaterial, Texture, Vector2 } from 'three'
import vertexShader from '../common.vert?raw'
import { fragmentShader } from './fragment'
import { texPixelRatio } from '../config'

export const material = new RawShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    dataTex: {
      value: new Texture(),
    },
    texResolution: {
      value: new Vector2(
        window.innerWidth * texPixelRatio,
        window.innerHeight * texPixelRatio
      ),
    },
  },
})

export const updateTexture = ({ texture }) => {
  material.uniforms.dataTex.value = texture
}

export const resize = ({ texResolution }) => {
  material.uniforms.texResolution.value = texResolution
}
