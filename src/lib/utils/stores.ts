import { deepEqual } from '$lib/utils'
import { readable, writable, type Readable, type Writable } from 'svelte/store'
import { browser } from '$app/environment'
import { registerLocalStorage } from './cache'
import { settings } from '$lib/settings/store'

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

export function persist<T>(key: string, initial: T): Writable<T> & { refresh: () => void } {
  function readData() {
    let data = initial
    if (browser) {
      const stored = localStorage.getItem(key)
      data = stored ? (JSON.parse(stored) as T) : initial
    }

    return data
  }

  const store = writable<T>(readData())

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value))
  })

  registerLocalStorage(key)

  return {
    ...store,
    refresh: () => store.set(readData()),
  }
}

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
