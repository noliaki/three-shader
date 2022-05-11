import {
  WebGLRenderTarget,
  Scene,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
  Mesh,
} from 'three'

import vertexShader from './vertex-shader.glsl?raw'
import fragmentShader from './fragment-shader.glsl?raw'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'

const winWidth = window.innerWidth
const winHeight = window.innerHeight

export const geometry = new PlaneBufferGeometry(winWidth, winHeight, 1, 1)

export const material = new ShaderMaterial({
  uniforms: {
    uTime: {
      value: 0,
    },
    uProgress: {
      value: 0,
    },
    uFontTexture: {
      value: new Texture(),
    },
  },
  vertexShader,
  fragmentShader: `
      ${noise3D}
      ${fragmentShader}
    `,
})

export const mesh = new Mesh(geometry, material)
export const scene = new Scene()
export const renderTarget = new WebGLRenderTarget(winWidth, winHeight)

scene.add(mesh)

export const getTexture = ({ renderer, camera, time = 0, progress = 0 }) => {
  material.uniforms.uTime.value = time
  material.uniforms.uProgress.value = progress

  renderer.setRenderTarget(renderTarget)
  renderer.render(scene, camera)

  return renderTarget.texture
}

export const updateFontTexture = ({ texture }) => {
  material.uniforms.uFontTexture.value = texture
}
