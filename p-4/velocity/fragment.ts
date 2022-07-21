import shader from './fragment.frag?raw'
import sample from '../utils/sample.glsl?raw'

export const fragmentShader = `
precision highp float;

${sample}
${shader}
`
