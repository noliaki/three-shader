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
const renderLen = 2
let currentRenderIndex = 0

export const zanzoRenderTargets: {
  renderTarget: WebGLRenderTarget
  scene: Scene
  geometry: PlaneBufferGeometry
  material: ShaderMaterial
}[] = [...Array(renderLen)].map((_) => {
  const geometry = new PlaneBufferGeometry(winWidth, winHeight, 1, 1)

  const material = new ShaderMaterial({
    uniforms: {
      uZanzoTexture: {
        value: new Texture(),
      },
      uZanzoPrevTexture: {
        value: new Texture(),
      },
      uProgress: {
        value: 0,
      },
      uTime: {
        value: 0,
      },
    },
    vertexShader,
    fragmentShader: `
      ${noise3D}
      ${fragmentShader}
    `,
  })

  const mesh = new Mesh(geometry, material)
  const scene = new Scene()
  const renderTarget = new WebGLRenderTarget(winWidth, winHeight)

  scene.add(mesh)

  return {
    renderTarget,
    scene,
    geometry,
    material,
  }
})

export const getZanzoTexture = ({
  renderer,
  nextTexture,
  camera,
  progress,
  time,
}) => {
  const nextRenderIndex = (currentRenderIndex + 1) % 2
  const { renderTarget: currentTarget } = zanzoRenderTargets[currentRenderIndex]

  const {
    scene: nextScene,
    renderTarget: nextTarget,
    material: nextMaterial,
  } = zanzoRenderTargets[nextRenderIndex]

  nextMaterial.uniforms.uZanzoPrevTexture.value = currentTarget.texture
  nextMaterial.uniforms.uZanzoTexture.value = nextTexture
  nextMaterial.uniforms.uProgress.value = progress
  nextMaterial.uniforms.uTime.value = time

  renderer.setRenderTarget(nextTarget)
  renderer.render(nextScene, camera)

  currentRenderIndex = nextRenderIndex

  return nextTarget.texture
}
