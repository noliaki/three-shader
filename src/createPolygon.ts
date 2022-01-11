export type Position = [number, number, number]

export type Polygon = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
]

const radian = Math.PI / 180

export const createPolygon = (center: Position): Polygon => {
  const beginRadius = Math.random() * 360
  const r = Math.random() * 10 + 5

  return [...Array(9)].map((_, i) => {
    const index = i % 3

    if (index === 2) {
      return 0
    }

    const radius = (beginRadius + Math.floor(i / 3) * 120) * radian

    return index === 0
      ? center[0] + r * Math.cos(radius)
      : center[1] + r * Math.sin(radius)
  }) as Polygon
}
