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
      id: '',
      icon: undefined,
      name: d.label ?? 'Geolocation',
      ...g.position?.coords,
    }) as LocationItemDetails,
)

export const selectedLocationDetails = derived(
  [selectedLocation, locationGeolocation],
  ([location, geolocation]): LocationItemDetails | null => {
    if (!location) return null

    const savedLocations = get(settings).data.locations

    switch (location.type) {
      case 'saved':
        return savedLocations.find((l) => l.id === location.id) ?? savedLocations[0] ?? geolocation
      case 'geolocation':
        return geolocation
      case 'search':
        return location.item
      default:
        return savedLocations[0] ?? geolocation
    }
  },
)

export const coordinates = derived([selectedLocationDetails], ([l]): Coordinates | null => l ?? null)
