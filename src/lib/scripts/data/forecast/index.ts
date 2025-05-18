import type { Coordinates } from '$lib/types/data'
import { loadMetnoLocationforecast } from './providers/metno'

export async function loadForecast(coords: Coordinates, provider: 'metno') {
  switch (provider) {
    case 'metno':
      return loadMetnoLocationforecast(coords)
  }
}
