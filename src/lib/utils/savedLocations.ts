import { geolocationStore } from '$lib/stores/geolocation'
import { selectedLocation } from '$lib/stores/location'
import { settings } from '$lib/stores/settings'
import { ITEM_ID_GEOLOCATION, type Location, type LocationItemDetails } from '$lib/types/ui'
import { createUUID } from '$lib/utils/common'
import { get } from 'svelte/store'

export function deleteSavedLocation(item: LocationItemDetails) {
  // TODO: this is made to be forgotten when changing this setting
  const savedLocations = get(settings).data.locations

  const index = savedLocations.findIndex(
    (l) => l.latitude === item.coordinates?.latitude && l.longitude === item.coordinates?.longitude,
  )
  if (index === -1) return

  savedLocations.splice(index, 1)
  settings.writeSetting(['data', 'locations'], savedLocations)
}

export function saveLocation(item: LocationItemDetails) {
  console.log('save', item)
  if (item.id === ITEM_ID_GEOLOCATION) {
    item.coordinates = get(geolocationStore).position?.coords
  }

  if (!item.coordinates) return
  // TODO: this is made to be forgotten when changing this setting
  const savedLocations = get(settings).data.locations

  const newLocation: Location = {
    id: createUUID(),
    name: item.label,
    latitude: item.coordinates.latitude,
    longitude: item.coordinates.longitude,
    icon: 'map-pin',
    altitude: null,
  }
  if (item.coordinates.altitude) newLocation.altitude = item.coordinates.altitude
  savedLocations.push(newLocation)

  settings.writeSetting(['data', 'locations'], savedLocations)

  // select it
  selectedLocation.set({ type: 'saved', location: { ...newLocation } })
}
