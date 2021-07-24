export function debounce(cb: (...args: any) => void, interval: number = 300) {
  let timerId: number | undefined = undefined

  return (...args: any[]) => {
    if (timerId !== undefined) {
      window.clearTimeout(timerId)
    }

    timerId = window.setTimeout(() => {
      cb(...args)
    }, interval)
  }
}

export function loadImg(imgSrc: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject): void => {
    const img = new Image()

    img.addEventListener(
      'load',
      (_event: Event): void => {
        resolve(img)
      },
      {
        once: true,
      }
    )

    img.addEventListener(
      'error',
      (event: Event): void => {
        reject(event)
      },
      {
        once: true,
      }
    )

    img.src = imgSrc
  })
}
