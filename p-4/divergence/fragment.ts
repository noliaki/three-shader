import main from './fragment.glsl?raw'
import sampleVelocity from '../utils/sampleVelocity.glsl?raw'

export const fragmentShader = `
${sampleVelocity}
${main}
`
