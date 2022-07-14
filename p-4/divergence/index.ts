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
    texPixelRatio: {
      value: texPixelRatio,
    },
    resolution: {
      value: new Vector2(window.innerWidth, window.innerHeight),
    },
    dataTex: {
      value: new Texture(),
    },
  },
})
