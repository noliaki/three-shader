import shader from './fragment.frag?raw'
import samplePressure from '../utils/samplePressure.glsl?raw'

export const fragmentShader = `
precision highp float;

${samplePressure}
${shader}
`
