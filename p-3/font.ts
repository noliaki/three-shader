import { Texture, CanvasTexture } from 'three'

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')
const testure = new CanvasTexture(canvas)

canvas.width = window.innerWidth
canvas.height = window.innerHeight

context.fillStyle = '#fff'
context.font = `${Math.min(canvas.width, canvas.height)}px serif`
context.textBaseline = 'top'
context.textAlign = 'left'

export const getFontTexture = (
  text: string = 'A',
  width: number = window.innerWidth,
  height: number = window.innerHeight
): Texture => {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight)

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
