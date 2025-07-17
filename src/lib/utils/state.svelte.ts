import { writable, type Readable, type Writable } from 'svelte/store'

export function persist<T>(key: string, initial: T): Writable<T> {
  const stored = localStorage.getItem(key)
  const data = stored ? (JSON.parse(stored) as T) : initial
  const store = writable<T>(data)

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value))
  })

  return store
}

import { browser } from '$app/environment'

export class LocalStorageState<T> {
  value = $state<T>() as T

  constructor(
    private _key: string,
    initial: T,
  ) {
    let existingValue: T | undefined = undefined

    if (browser) {
      const item = localStorage.getItem(_key)
      if (item) existingValue = this.deserialize(item)
    }

    this.value = existingValue !== undefined ? existingValue : initial

    $effect(() => {
      localStorage.setItem(this._key, this.serialize(this.value))
    })
  }

  serialize(value: T): string {
    return JSON.stringify(value)
  }

  deserialize(item: string): T {
    return JSON.parse(item)
  }

  get key() {
    return this._key
  }
}

export function persistantState<T>(key: string, value: T) {
  return new LocalStorageState(key, value)
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
