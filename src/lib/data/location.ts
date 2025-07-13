import type { Coordinates } from '$lib/types/data'
import type { PlaceOutput } from '$lib/types/nominatim'

export async function reverseGeocoding(coordinates: Coordinates) {
  const cacheKey = 'known-locations'
  const knownLocations = JSON.parse(localStorage.getItem(cacheKey) ?? '{}') as Record<string, PlaceOutput>
  const coordinatesKey = `${coordinates.latitude}-${coordinates.longitude}`
  console.log(knownLocations[coordinatesKey])
  if (knownLocations[coordinatesKey]) return knownLocations[coordinatesKey]

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
  const { neighbourhood, suburb, town, county, city } = place.address!
  const name = place.name !== '' ? place.name : undefined
  const specific = name ?? neighbourhood ?? suburb
  const general = town ?? city ?? county
  if (specific && general) return specific + ', ' + general
  return place.display_name
}
