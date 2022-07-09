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
    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    texPixelRatio: { value: texPixelRatio },
    dataTex: { value: new Texture() },
    attenuation: { value: attenuation }, // 減衰,
  },
})
