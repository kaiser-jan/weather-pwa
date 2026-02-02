import { derived, writable } from 'svelte/store'

const locationSearchStore = writable({}, () => {})

export const forecastStore = {
  subscribe: locationSearchStore.subscribe,
}
