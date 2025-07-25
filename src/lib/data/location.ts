import type { Coordinates } from '$lib/types/data'
import type { PlaceOutput } from '$lib/types/nominatim'

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
