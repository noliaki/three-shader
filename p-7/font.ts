import { Texture, CanvasTexture } from 'three'

let canvas = document.createElement('canvas')
let context = canvas.getContext('2d')!
let testure = new CanvasTexture(canvas)

export const resize = ({
  width = window.innerWidth,
  height = window.innerHeight,
} = {}) => {
  if (canvas == null) {
    return
  }

  canvas.width = width
  canvas.height = height

  context = canvas.getContext('2d')!
  context.fillStyle = '#fff'
  context.font = `${Math.min(canvas.width, canvas.height) * 0.7}px serif`
  context.textBaseline = 'top'
  context.textAlign = 'left'
  testure = new CanvasTexture(canvas)
}

export const getFontTexture = (text: string = 'A'): Texture => {
  const width = context.canvas.width
  const height = context.canvas.height
  context.clearRect(0, 0, width, height)

  const result = context.measureText(text)
  const textWidth = result.width
  const textHeight =
    result.actualBoundingBoxAscent + result.actualBoundingBoxDescent

  context.fillText(
    text,
    Math.random() * (width - textWidth),
    Math.random() * (height - textHeight)
  )

  testure.image = canvas
  testure.needsUpdate = true

  return testure
}

resize()
