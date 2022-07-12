import main from './fragment.frag?raw'
import sampleVelocity from '../utils/sampleVelocity.glsl?raw'

export const fragmentShader = `
precision highp float;

${sampleVelocity}
${main}
`
