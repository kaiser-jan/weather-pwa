import { settings } from '$lib/settings/store'
import type { Coordinates, TimeBucket } from '$lib/types/data'
import type { Location } from '$lib/types/ui'
import { get, writable } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

type LocationSelection =
  | { type: 'saved'; location: Location }
  | { type: 'geolocation' }
  | { type: 'search'; coordinates: Coordinates }

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

function getLocationSaved(id: string): LocationSelection {
  const settingLocations = get(settings).data.locations
  let location = settingLocations.find((l) => l.id === id)
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

export const selectedDay = writable<TimeBucket | null>(null)
export const showLocationSearch = writable<boolean>(false)
