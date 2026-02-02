import { settings } from '$lib/stores/settings'
import { type LocationItemDetails } from '$lib/types/ui'
import { createUUID } from '$lib/utils/common'
import { get } from 'svelte/store'
import { reverseGeocoding } from './location'
import { selectSavedLocation } from '$lib/stores/location'

export function deleteSavedLocation(item: LocationItemDetails) {
  // TODO: this is made to be forgotten when changing this setting
  const savedLocations = get(settings).data.locations

  const index = savedLocations.findIndex((l) => l.id === item.id)
  if (index === -1) return

  savedLocations.splice(index, 1)
  settings.writeSetting(['data', 'locations'], savedLocations)
}

export async function saveLocation(item: LocationItemDetails) {
  if (item.longitude === undefined || item.latitude === undefined) return

  // TODO: this is made to be forgotten when changing this setting
  const savedLocations = get(settings).data.locations

  const locationToSave: LocationItemDetails = {
    icon: 'map-pin',
    ...item,
    id: createUUID(),
  }

  savedLocations.push(locationToSave)
  settings.writeSetting(['data', 'locations'], savedLocations)
  selectSavedLocation(locationToSave.id)

  // TODO: allow items to be reverse-geocoded earlier
  // -> reuse item.geocoding
  const geocoding = await reverseGeocoding(item)
  locationToSave.geocoding = geocoding

  savedLocations.pop()
  savedLocations.push(locationToSave)
  settings.writeSetting(['data', 'locations'], savedLocations)
  selectSavedLocation(locationToSave.id)
}
