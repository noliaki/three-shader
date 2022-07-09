import shader from './fragment.frag?raw'
import samplePressure from '../utils/samplePressure.glsl?raw'
import map from '../utils/map.glsl?raw'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'

export const fragmentShader = `
${noise3D}
${map}
${samplePressure}
${shader}
`
