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

export function toReadable<T>(value: T | Readable<T>): Readable<T> {
  return isStore(value) ? (value as Readable<T>) : readable(value as T)
}
