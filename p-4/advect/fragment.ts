import shader from './fragment.frag?raw'
import samplePressure from '../utils/samplePressure.glsl?raw'
import sampleVelocity from '../utils/sampleVelocity.glsl?raw'

export const fragmentShader = `
${sampleVelocity}
${samplePressure}
${shader}
`
