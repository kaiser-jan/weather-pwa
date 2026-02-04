import { derived, get } from 'svelte/store'
import { type LocationItemDetails } from '$lib/types/ui'
import { geolocationStore } from './geolocation'
import type { Coordinates } from '$lib/types/data'
import { settings } from '$lib/stores/settings'
import { persisted } from 'svelte-persisted-store'

export type LocationSelection =
  | { type: 'saved'; id: string }
  | { type: 'geolocation' }
  | { type: 'search'; item: LocationItemDetails }

export const selectedLocation = persisted<LocationSelection | null>('selected-location', null)

export function selectGeolocation() {
  geolocationStore.start()
  selectedLocation.set({ type: 'geolocation' })
}
export function selectSavedLocation(id: string) {
  selectedLocation.set({ type: 'saved', id })
}
export function selectSearchedLocation(item: LocationItemDetails) {
  selectedLocation.set({ type: 'search', item })
}

export const locationGeolocation = derived(
  [geolocationStore, geolocationStore.details],
  ([g, d]) =>
    ({
      ...d,
      id: '',
      icon: 'navigation',
      name: d.label ?? 'Geolocation',
      latitude: g.position?.coords.latitude,
      longitude: g.position?.coords.longitude,
      altitude: g.position?.coords.altitude,
    }) as LocationItemDetails,
)

// TODO: handle deleting selected saved location
export const selectedLocationDetails = derived(
  [selectedLocation, locationGeolocation],
  ([location, geolocation]): LocationItemDetails | null => {
    if (!location) return null

    const savedLocations = get(settings).data.locations

    function fallback() {
      const fallback = savedLocations[0]
      if (fallback) {
        selectSavedLocation(fallback.id)
        return fallback
      }
      return geolocation
    }

    switch (location.type) {
      case 'saved':
        const savedLocation = savedLocations.find((l) => l.id === location.id)
        if (savedLocation) return savedLocation
        return fallback()
      case 'geolocation':
        return geolocation
      case 'search':
        return location.item
      default:
        return fallback()
    }
  },
)

export const coordinates = derived([selectedLocationDetails], ([l]): Coordinates | null => {
  if (l && l.latitude !== undefined && l.longitude !== undefined) return l
  return null
})
