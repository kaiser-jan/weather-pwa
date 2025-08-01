import { writable, type Readable, type Writable } from 'svelte/store'
import { browser } from '$app/environment'
import { registerLocalStorage } from './cache'

export function persist<T>(key: string, initial: T): Writable<T> {
  let data = initial
  if (browser) {
    const stored = localStorage.getItem(key)
    data = stored ? (JSON.parse(stored) as T) : initial
  }

  const store = writable<T>(data)

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value))
  })

  registerLocalStorage(key)

  return store
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
