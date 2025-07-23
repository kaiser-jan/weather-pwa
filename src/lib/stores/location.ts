import { derived } from 'svelte/store'
import { geolocationStore } from './geolocation'
import { selectedLocation } from './ui'
import type { Coordinates } from '$lib/types/data'

export const coordinates = derived([selectedLocation, geolocationStore], ([l, g]): Coordinates | null => {
  switch (l?.type) {
    case 'saved':
      return l.location
    case 'search':
      return l.coordinates
    case 'geolocation':
      return g.position?.coords ?? null
    default:
      return null
  }
})
