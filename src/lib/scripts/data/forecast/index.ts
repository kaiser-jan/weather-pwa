import type { Coordinates } from '$lib/types/data'
import { loadGeosphereLocationforecast } from './providers/geosphere-at'
import { loadMetnoLocationforecast } from './providers/metno'

export async function loadForecast(coords: Coordinates, provider: 'met.no' | 'geosphere.at') {
  switch (provider) {
    case 'met.no':
      return loadMetnoLocationforecast(coords)
    case 'geosphere.at':
      return loadGeosphereLocationforecast(coords)
  }
}
