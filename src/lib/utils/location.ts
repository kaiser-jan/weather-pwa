import type { Coordinates } from '$lib/types/data'
import type { PlaceOutput } from '$lib/types/nominatim'
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
} from '@lucide/svelte'

/**
 * Uses nominatem.openstreetmap.org to retrieve the location details for the given coordinates
 */
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

/**
 * Tries to convert a PlaceOutput to a human readable string containing up to three area names in decreasing specificity
 */
export function placeToWeatherLocation(place: PlaceOutput | undefined) {
  if (place === undefined || !place.address) return undefined
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
/**
 * Calculates the great circle distance between two coordinates on earth and converts it to meters
 */
export function getDistanceBetweenCoordinatesMeters(
  a: Coordinates | null | undefined,
  b: Coordinates | null | undefined,
): number | null {
  if (!a || !b) return null
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}
