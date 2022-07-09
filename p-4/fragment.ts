import shader from './fragment.frag?raw'
import map from '../utils/map.glsl?raw'

export const fragmentShader = `
${map}
${shader}
`
