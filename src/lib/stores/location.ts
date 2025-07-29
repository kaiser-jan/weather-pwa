import { derived, get } from 'svelte/store'
import type { Location } from '$lib/types/ui'
import { geolocationStore } from './geolocation'
import type { Coordinates } from '$lib/types/data'
import { settings } from '$lib/settings/store'
import { persisted } from 'svelte-persisted-store'

export const selectedLocation = persisted<LocationSelection | null>('selected-location', null, {
  // some safety for parsing - maybe consider zod
  beforeRead: (previous) => {
    if (!previous) return null

    switch (previous.type) {
      case 'geolocation':
        return { type: 'geolocation' }
      case 'search':
        return { type: 'search', coordinates: previous.coordinates }
      case 'saved':
        return getLocationSaved(previous.location.id)
      default:
        return getLocationFallback()
    }
  },
})

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

function getLocationSaved(id: string): LocationSelection {
  const settingLocations = get(settings).data.locations
  const location = settingLocations.find((l) => l.id === id)
  if (location) {
    return { type: 'saved', location }
  }

  return getLocationFallback()
}

function getLocationFallback(): LocationSelection {
  const settingLocations = get(settings).data.locations
  const firstLocation = settingLocations[0]
  if (firstLocation) {
    return { type: 'saved', location: firstLocation }
  } else {
    return { type: 'geolocation' }
  }
}

type LocationSelection =
  | { type: 'saved'; location: Location }
  | { type: 'geolocation' }
  | { type: 'search'; coordinates: Coordinates }
