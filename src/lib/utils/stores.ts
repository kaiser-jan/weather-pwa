import { type Readable } from 'svelte/store'

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
