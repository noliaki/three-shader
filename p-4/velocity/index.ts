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
    pointerPos: {
      value: new Vector2(
        (window.innerWidth / 2) * texPixelRatio,
        (window.innerHeight / 2) * texPixelRatio
      ),
    },
    beforePointerPos: {
      value: new Vector2(
        (window.innerWidth / 2) * texPixelRatio,
        (window.innerHeight / 2) * texPixelRatio
      ),
    },
    texResolution: {
      value: new Vector2(
        window.innerWidth * texPixelRatio,
        window.innerHeight * texPixelRatio
      ),
    },
  },
})

export const update = ({ time, pointerPos, beforePointerPos, dataTex }) => {
  material.uniforms.time.value = time
  material.uniforms.pointerPos.value = pointerPos
  material.uniforms.beforePointerPos.value = beforePointerPos
  material.uniforms.dataTex.value = dataTex
}

export const resize = ({ texResolution }) => {
  material.uniforms.texResolution.value = texResolution
}
