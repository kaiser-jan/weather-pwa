import type { Readable } from 'svelte/store'

export function select<T, U>(
  store: Readable<T>,
  selector: (s: T) => U,
  isEqual: (a: U, b: U) => boolean = Object.is,
): Readable<U> {
  return {
    subscribe(run) {
      let prev: U
      return store.subscribe((value) => {
        const next = selector(value)
        if (prev === undefined || !isEqual(prev, next)) {
          prev = next
          run(next)
        }
      })
    },
  }
}
