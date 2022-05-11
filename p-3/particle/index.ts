import {
  WebGLRenderTarget,
  Scene,
  Mesh,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  DoubleSide,
} from 'three'
import { createPolygon } from '../../src/createPolygon'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'
import vShader from './vertex-shader.glsl?raw'
import fShader from './fragment-shader.glsl?raw'

const winWidth = window.innerWidth
const winHeight = window.innerHeight

const createGeometry = (
  width: number = winWidth,
  height: number = winHeight
) => {
  const position = []
  const center = []
  const index = []
  const stagger = []

  for (let i: number = 0; i < 5000; i++) {
    const centerX = Math.random() * width - width * 0.5
    const centerY = Math.random() * height - height * 0.5
    const centerZ = 0

    position.push(...createPolygon([centerX, centerY, centerZ]))
    index.push(i)
    stagger.push(Math.random())

    for (let j: number = 0; j < 3; j++) {
      center.push(centerX, centerY, centerZ)
    }
  }

  const geometry = new BufferGeometry()

  geometry.setAttribute(
    'aPosition',
    new BufferAttribute(new Float32Array(position), 3)
  )

  geometry.setAttribute(
    'aCenter',
    new BufferAttribute(new Float32Array(center), 3)
  )

  geometry.setAttribute(
    'aIndex',
    new BufferAttribute(new Float32Array(index), 1)
  )

  geometry.setAttribute(
    'aStagger',
    new BufferAttribute(new Float32Array(stagger), 1)
  )

  geometry.setIndex(index)

  return geometry
}

export const renderTarget = new WebGLRenderTarget(winWidth, winHeight)
export const scene = new Scene()
export const material = new ShaderMaterial({
  uniforms: {
    uTime: {
      value: 0,
    },
    uResolution: {
      value: [winWidth, winHeight],
    },
    uProgress: {
      value: 0,
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
  side: DoubleSide,
})
export const mesh = new Mesh(createGeometry(), material)

export const getUpdatedTexture = ({ renderer, time, camera }) => {
  material.uniforms.uTime.value = time
  renderer.setRenderTarget(renderTarget)
  renderer.render(scene, camera)

  return renderTarget.texture
}

scene.add(mesh)
