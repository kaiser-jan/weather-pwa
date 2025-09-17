import { settings } from '$lib/settings/store'
import { geolocationStore } from '$lib/stores/geolocation'
import { selectedLocation } from '$lib/stores/location'
import type { Coordinates } from '$lib/types/data'
import type { PlaceOutput } from '$lib/types/nominatim'
import { ITEM_ID_GEOLOCATION, type Location } from '$lib/types/ui'
import { createUUID } from '$lib/utils'
import {
  type Icon as IconType,
  AlertCircleIcon,
  BinocularsIcon,
  BuildingIcon,
  CarIcon,
  DumbbellIcon,
  HammerIcon,
  LandmarkIcon,
  LayersIcon,
  LeafIcon,
  MapPinIcon,
  MountainIcon,
  PlaneIcon,
  StoreIcon,
  TrainIcon,
  WavesIcon,
  Icon,
} from '@lucide/svelte'
import { get } from 'svelte/store'

export async function reverseGeocoding(coordinates: Coordinates) {
  const cacheKey = 'known-locations'
  const knownLocations = JSON.parse(localStorage.getItem(cacheKey) ?? '{}') as Record<string, PlaceOutput>
  const coordinatesKey = `${coordinates.latitude}-${coordinates.longitude}`
  if (knownLocations[coordinatesKey]) {
    console.debug(`Reverse geocoded location for ${coordinatesKey} found in cache!`)
    return knownLocations[coordinatesKey]
  }

  console.debug(`Fetching reverse geocoded location for ${coordinatesKey}...`)
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', coordinates.latitude.toString())
  url.searchParams.set('lon', coordinates.longitude.toString())
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('zoom', '18') // https://nominatim.org/release-docs/develop/api/Reverse/#result-restriction
  const result = await fetch(url.toString())
  const json = (await result.json()) as PlaceOutput

  knownLocations[coordinatesKey] = json
  localStorage.setItem(cacheKey, JSON.stringify(knownLocations))

  return json
}

export function placeToWeatherLocation(place: PlaceOutput) {
  const { road, house_number, hamlet, neighbourhood, suburb, town, county, city, village } = place.address!
  const name = place.name !== '' ? place.name : undefined
  let roadName = road
  if (roadName && house_number) roadName += ` ${house_number}`
  const specific = roadName ?? name
  const middle = hamlet ?? neighbourhood ?? suburb
  const general = village ?? town ?? city ?? county
  const items = [specific, middle, general].filter(Boolean)
  return items.join(', ')
}

export function typeToString(label: string) {
  // https://wiki.openstreetmap.org/wiki/Key:building
  if (label === 'yes') return 'Building'
  const items = label.split('_')
  const itemsUppercase = items.map((i) => i.charAt(0).toUpperCase() + i.slice(1))
  return itemsUppercase.join(' ')
}

// https://gist.githubusercontent.com/seeebiii/d929a2ee2601791554d315f212164ed6/raw/poi_nominatim.json
export const classIconMap: Record<string, typeof IconType> = {
  boundary: MapPinIcon,
  historic: LandmarkIcon,
  shop: StoreIcon,
  natural: LeafIcon,
  man_made: HammerIcon,
  amenity: BuildingIcon,
  waterway: WavesIcon,
  mountain_pass: MountainIcon,
  emergency: AlertCircleIcon,
  tourism: BinocularsIcon,
  building: BuildingIcon,
  landuse: LayersIcon,
  place: MapPinIcon,
  railway: TrainIcon,
  highway: CarIcon,
  leisure: DumbbellIcon,
  aeroway: PlaneIcon,
}

export type Item = {
  id: string
  icon: typeof Icon | null
  label: string
  sublabel?: string
  coordinates?: Coordinates
  select: () => void
}
export function deleteSavedLocation(item: Item) {
  // TODO: this is made to be forgotten when changing this setting
  const savedLocations = get(settings).data.locations

  const index = savedLocations.findIndex(
    (l) => l.latitude === item.coordinates?.latitude && l.longitude === item.coordinates?.longitude,
  )
  if (index === -1) return

  savedLocations.splice(index, 1)
  settings.writeSetting(['data', 'locations'], savedLocations)
}

// TODO: refactor and decouple
export function saveLocation(item: Item) {
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
