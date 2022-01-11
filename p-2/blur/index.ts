import {
  Texture,
  PlaneBufferGeometry,
  ShaderMaterial,
  Mesh,
  Scene,
  WebGLRenderTarget,
} from 'three'
import vertexShader from './vertex-shader.glsl?raw'
import fragmentShader from './fragment-shader.glsl?raw'

export const blurRenderTargets = [...Array(2)].map((_) => {
  let blurVol = 10
  let defaultDistance = 50

  const calc = (i: number, d: number): number => {
    const r = 1 + 2 * i
    const w = Math.exp((-0.5 * (r * r)) / d)

    return w
  }

  const getWeight = (
    { distance = defaultDistance, vol = blurVol } = {
      distance: defaultDistance,
      vol: blurVol,
    }
  ) => {
    const t = new Array(vol).fill(0).reduce((acc, _curr, i) => {
      const w = calc(i, distance)

      acc += i > 0 ? w * 2 : w

      return acc
    }, 0)

    return new Array(vol).fill(0).map((_, i) => calc(i, distance) / t)
  }

  const updataWeight = ({
    distance,
    vol,
  }: {
    distance?: number
    vol?: number
  }) => {
    defaultDistance = distance ?? defaultDistance
    blurVol = vol ?? blurVol

    material.uniforms.uWeight.value = getWeight({
      distance: defaultDistance,
      vol: blurVol,
    })

    material.uniforms.uBlurTimes.value = blurVol
  }

  const geometry = new PlaneBufferGeometry(
    window.innerWidth,
    window.innerHeight,
    1,
    1
  )
  const material = new ShaderMaterial({
    uniforms: {
      uBlurBlurTexture: {
        value: new Texture(),
      },
      uWeight: {
        value: getWeight(),
      },
      uIsHorizontal: {
        value: false,
      },
      uResolution: {
        value: [window.innerWidth, window.innerHeight],
      },
      uBlurTimes: {
        value: 10,
      },
    },
    vertexShader,
    fragmentShader,
  })
  const mesh = new Mesh(geometry, material)
  const scene = new Scene()
  const renderTarget = new WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
  )

  scene.add(mesh)

  return {
    renderTarget,
    scene,
    geometry,
    material,
    updataWeight,
  }
})

export const getBlurTexture = ({ texture, renderer, camera }): Texture => {
  blurRenderTargets.forEach(({ material, scene, renderTarget }, i) => {
    const isHorizontal = i === 0
    const blurTexture = isHorizontal
      ? texture
      : blurRenderTargets[0].renderTarget.texture

    material.uniforms.uIsHorizontal.value = isHorizontal
    material.uniforms.uBlurBlurTexture.value = blurTexture

    renderer.setRenderTarget(renderTarget)
    renderer.render(scene, camera)
  })

  return blurRenderTargets[1].renderTarget.texture
}
