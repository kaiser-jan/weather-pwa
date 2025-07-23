import { deepEqual } from '$lib/utils'
import { readable, type Readable } from 'svelte/store'

export function select<T, U>(
  store: Readable<T>,
  selector: (s: T) => U,
  isEqual: (a: U, b: U) => boolean = deepEqual,
): Readable<U> {
  return {
    subscribe(run) {
      let prev: U
      return store.subscribe((value) => {
        const next = selector(value)
        console.debug('store select compare', prev, next, isEqual(prev, next))
        if (prev === undefined || !isEqual(prev, next)) {
          prev = structuredClone(next)
          run(next)
        }
      })
    },
  }
}

export function isStore<T = unknown>(value: unknown): value is { subscribe: (run: (value: T) => void) => unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'subscribe' in value &&
    typeof (value as any).subscribe === 'function'
  )
}

type AsyncFn<T> = () => Promise<T>
export function toReadable<T>(value: T | Readable<T> | AsyncFn<T>): Readable<T> {
  if (isStore(value)) {
    return value
  }

  if (typeof value === 'function') {
    const fn = value as AsyncFn<T>
    return readable<T>(undefined as any, (set) => {
      let cancelled = false
      fn().then((res) => {
        if (!cancelled) set(res)
      })
      return () => {
        cancelled = true
      }
    })
  }

  return readable(value as T)
}
