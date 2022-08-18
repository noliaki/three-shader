// =================
// 速度
import { RawShaderMaterial, Texture, Vector2 } from 'three'
import vertexShader from '../common.vert?raw'
import { fragmentShader } from './fragment'
import {
  texPixelRatio,
  viscosity,
  forceRadius,
  forceCoefficient,
  autoforceCoefficient,
} from '../config'

export const material = new RawShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 },
    viscosity: { value: viscosity },
    forceRadius: { value: forceRadius * texPixelRatio },
    forceCoefficient: { value: forceCoefficient },
    autoforceCoefficient: { value: autoforceCoefficient },
    dataTex: { value: new Texture() },
    textTex: { value: new Texture() },
    texResolution: {
      value: new Vector2(
        window.innerWidth * texPixelRatio,
        window.innerHeight * texPixelRatio
      ),
    },
  },
})

export const update = ({ time, dataTex }) => {
  material.uniforms.time.value = time
  material.uniforms.dataTex.value = dataTex
}

export const updateTextTex = ({ texture }) => {
  material.uniforms.textTex.value = texture
}

export const resize = ({ texResolution }) => {
  material.uniforms.texResolution.value = texResolution
}
