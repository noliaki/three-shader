// =================
// 速度
import { RawShaderMaterial, Texture, Vector2, WebGLRenderTarget } from 'three'
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
    texPixelRatio: { value: texPixelRatio },
    viscosity: { value: viscosity },
    forceRadius: { value: forceRadius },
    forceCoefficient: { value: forceCoefficient },
    autoforceCoefficient: { value: autoforceCoefficient },
    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    dataTex: { value: new Texture() },
    pointerPos: {
      value: new Vector2(window.innerWidth / 2, window.innerHeight / 2),
    },
    beforePointerPos: {
      value: new Vector2(window.innerWidth / 2, window.innerHeight / 2),
    },
  },
})
