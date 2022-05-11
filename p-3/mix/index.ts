import {
  Scene,
  Mesh,
  PlaneBufferGeometry,
  Texture,
  ShaderMaterial,
  WebGLRenderTarget,
} from 'three'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'
import vShader from './vertex-shader.glsl?raw'
import fShader from './fragment-shader.glsl?raw'

export const renderTarget = new WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
)
export const scene = new Scene()
export const geometry = new PlaneBufferGeometry(
  window.innerWidth,
  window.innerHeight,
  1,
  1
)
export const material = new ShaderMaterial({
  uniforms: {
    uMixBlurTexture: {
      value: new Texture(),
    },
    uMixParticleTexture: {
      value: new Texture(),
    },
    uFontTexture: {
      value: new Texture(),
    },
  },
  vertexShader: `
    ${noise3D}
    ${vShader}
  `,
  fragmentShader: `
    ${noise3D}
    ${fShader}
  `,
})

export const mesh = new Mesh(geometry, material)

export const updateFontTexture = ({ texture }) => {
  material.uniforms.uFontTexture.value = texture
}

export const getUpdatedTexture = ({
  renderer,
  camera,
  blurTexture,
  particleTexture,
}) => {
  material.uniforms.uMixBlurTexture.value = blurTexture
  material.uniforms.uMixParticleTexture.value = particleTexture

  renderer.setRenderTarget(renderTarget)
  renderer.render(scene, camera)

  return renderTarget.texture
}

scene.add(mesh)
