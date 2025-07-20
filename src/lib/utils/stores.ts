import { deepEqual } from '$lib/utils'
import type { Readable } from 'svelte/store'

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
