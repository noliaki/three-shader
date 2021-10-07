import main from './main.glsl?raw'
import noise3D from '../../webgl-noise/src/noise3D.glsl?raw'

export default `
  ${noise3D}
  ${main}
`
