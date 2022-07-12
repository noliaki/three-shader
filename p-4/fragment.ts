import shader from './fragment.frag?raw'
import map from './utils/map.glsl?raw'

export const fragmentShader = `
precision highp float;

${map}
${shader}
`
