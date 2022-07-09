import './style.css'
import {
  WebGLRenderer,
  OrthographicCamera,
  Texture,
  RawShaderMaterial,
  Vector2,
  PlaneBufferGeometry,
  Mesh,
  Scene,
} from 'three'
import { debounce } from '../src/utility'
import vertexShader from './common.vert?raw'
import { fragmentShader } from './fragment'
import { texPixelRatio } from './config'
import { renderTarget } from '../p-3/color'

const start = Date.now()
const winWidth = window.innerWidth
const winHeight = window.innerHeight

const mesh = new Mesh(
  new PlaneBufferGeometry(winWidth, winHeight, 1, 1),
  new RawShaderMaterial({
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      texPixelRatio: { value: texPixelRatio },
      dataTex: { value: new Texture() },
      resolution: { value: new Vector2(winWidth, winHeight) },
      devicePixelRatio: { value: devicePixelRatio },
    },
  })
)

const scene = new Scene()
const camera = new OrthographicCamera(
  -winWidth * 0.5,
  winWidth * 0.5,
  winHeight * 0.5,
  -winHeight * 0.5,
  0.1,
  100
)
const renderer = new WebGLRenderer({
  alpha: true,
})

const update = () => {
  const time = Date.now() - start

  requestAnimationFrame(update)
}

scene.add(mesh)
update()
