import shader from './fragment.frag?raw'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'

export const fragmentShader = `
precision mediump float;

${noise3D}
${shader}
`
