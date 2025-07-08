import type { Coordinates, Forecast, MultivariateTimeSeries } from '$lib/types/data'
import type { Dataset, Provider } from '$lib/types/data/providers'
import { mergeMultivariateTimeSeries } from '$lib/utils/data'
import { combineMultiseriesToDailyForecast, currentFromMultiseries, forecastTotalFromDailyForecast } from '../utils'
import nowcast from './geosphere.at/nowcast'
import nwp from './geosphere.at/nwp'
import nwpOffset from './geosphere.at/nwp-offset'
import locationforecast from './met.no/locationforecast'

const PROVIDER_IDS = ['geosphere.at', 'met.no'] as const

const DATASET_IDS = [
  'geosphere.at_nwp-v1-1h-2500m',
  'geosphere.at_nwp-v1-1h-2500m_offset',
  'geosphere.at_nowcast-v1-15min-1km',
  'met.no_locationforecast',
] as const

export const PROVIDERS: Record<ProviderId, Provider> = {
  'geosphere.at': { name: 'GeoSphere Austria', url: 'https://geosphere.at/', country: 'AT' },
  'met.no': {
    name: 'Norwegian Meteorological Institute',
    url: 'https://www.met.no/',
    country: 'NO',
  },
} as const

// TODO: details about combined models like
// https://api.met.no/doc/locationforecast/datamodel
export const DATASETS: Record<DatasetId, Dataset> = {
  'geosphere.at_nwp-v1-1h-2500m': nwp.meta,
  'geosphere.at_nwp-v1-1h-2500m_offset': nwpOffset.meta,
  'geosphere.at_nowcast-v1-15min-1km': nowcast.meta,
  'met.no_locationforecast': locationforecast.meta,
}

export const LOADERS: Record<DatasetId, (coordinates: Coordinates) => Promise<MultivariateTimeSeries>> = {
  'geosphere.at_nwp-v1-1h-2500m': nwp.load,
  'geosphere.at_nwp-v1-1h-2500m_offset': nwpOffset.load,
  'geosphere.at_nowcast-v1-15min-1km': nowcast.load,
  'met.no_locationforecast': locationforecast.load,
}

export async function loadForecast(coordinates: Coordinates, datasets: DatasetId[]): Promise<Forecast> {
  const loaders = datasets.map((d) => LOADERS[d])
  const promises = loaders.map((l) => graceful(l(coordinates)))

  const results = (await Promise.all(promises)).filter((r) => r !== null)

  let multiseries: MultivariateTimeSeries = results[0]

  for (let i = 1; i < results.length; i++) {
    multiseries = mergeMultivariateTimeSeries(multiseries, results[i])
  }

  const daily = combineMultiseriesToDailyForecast(multiseries)

  const total = forecastTotalFromDailyForecast(daily)

  const current = currentFromMultiseries(multiseries)

  return {
    current,
    multiseries,
    daily,
    total,
  }
}

// NOTE: workaround to allow parallel api calls and ignoring failure of one call
// TODO: this should be redundant when implementing proper error handling like with the ts-result Result type
async function graceful<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch {}
  return null
}
export type DatasetId = (typeof DATASET_IDS)[number]
export type ProviderId = (typeof PROVIDER_IDS)[number]
