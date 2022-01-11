import {
  Scene,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
} from 'three'

import vertexShader from './vertex-shader.glsl?raw'
import fragmentShader from './fragment-shader.glsl?raw'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'

const geometry = new PlaneBufferGeometry(
  window.innerWidth,
  window.innerHeight,
  1,
  1
)
const material = new ShaderMaterial({
  uniforms: {
    uDisplayTexture: {
      value: new Texture(),
    },
  },
  vertexShader,
  fragmentShader: `
    ${noise3D}
    ${fragmentShader}
  `,
})
export const scene = new Scene()
export const mesh = new Mesh(geometry, material)

export const updateTexture = ({ texture }) => {
  material.uniforms.uDisplayTexture.value = texture
}

scene.add(mesh)
