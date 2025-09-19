import { deepEqual } from '$lib/utils/common'
import { readable, writable, type Readable, type Writable } from 'svelte/store'
import { browser } from '$app/environment'

/**
 * Creates a subscription to a nested part of the store according to the selector.
 * The subscription only fires when this part changes, and ignores changes to the rest of the store.
 *
 * @param selector A function which returns the part of the store to subscribe to. Being a callback allows for type support.
 * @param isEqual A callback which allows for overriding the equality checks, e.g. for objects.
 */
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

/**
 * A helper to convert either a value, a value callback or a Readable to a Readable.
 */
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

/**
 * Subscribes to a store but ignores the first callback which is fired when the subscription is created.
 */
export function subscribeNonImmediate<T>(store: Readable<T>, subscription: (value: T) => void) {
  let isFirst = true

  return store.subscribe((state) => {
    if (isFirst) {
      isFirst = false
    } else {
      subscription(state)
    }
  })
}
