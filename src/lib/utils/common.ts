export function debounce<F extends (...args: any[]) => void>(callback: F, wait: number, immediate = false): F {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    const shouldCallNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      if (!shouldCallNow) {
        callback(...args)
      }
    }, wait)

    if (shouldCallNow) {
      callback(...args)
    }
  }

  return debounced as F
}

export function throttle<F extends (...args: any[]) => void>(callback: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  let lastTime: number = 0

  const throttled = (...args: Parameters<F>) => {
    clearTimeout(timeout)
    const delay = Math.max(wait - (Date.now() - lastTime), 0)
    timeout = setTimeout(() => {
      if (Date.now() - lastTime >= wait) {
        callback(...args)
        lastTime = Date.now()
      }
    }, delay)
  }

  return throttled
}

// NOTE: crypto.randomUUID is not available over http
export function createUUID() {
  return crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now()
}

export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
