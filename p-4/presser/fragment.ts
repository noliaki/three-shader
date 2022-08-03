import shader from './fragment.frag?raw'
import sample from '../utils/sample.glsl?raw'

export const fragmentShader = `
precision mediump float;

${sample}
${shader}
`
