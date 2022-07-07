import { PlaneBufferGeometry, Mesh, Scene } from 'three'

export const mesh = new Mesh(
  new PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1, 1)
)

export const scene = new Scene()

scene.add(mesh)
