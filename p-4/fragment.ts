import shader from './fragment.frag?raw'
import map from './utils/map.glsl?raw'
import noise3D from '../webgl-noise/src/noise3D.glsl?raw'

export const fragmentShader = `
precision highp float;

${noise3D}
${map}
${shader}
`
