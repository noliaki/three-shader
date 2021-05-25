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
