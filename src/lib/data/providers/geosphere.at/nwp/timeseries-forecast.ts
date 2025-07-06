import type { Coordinates, MultivariateTimeSeries } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { calculateVector } from '$lib/utils'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import { symbolToWeatherSituationMap } from '../symbols'
import meta from './meta'
import { transformTimeSeries, type TimeSeriesConfig } from '$lib/utils/data'

export const REQUESTED_WEATHER_PARAMETERS: (typeof meta.availableParameters)[number][] = [
  'cape',
  'cin',
  'grad',
  // 'mnt2m',
  // 'mxt2m',
  // 'rain_acc',
  'rh2m',
  'rr_acc',
  // 'snow_acc',
  // 'snowlmt',
  'sp',
  // 'sundur_acc',
  'sy',
  't2m',
  'tcc',
  'ugust',
  'u10m',
  'v10m',
  'vgust',
] as const

export async function loadGeosphereNwpTimeseriesForecast(
  coordinates: Coordinates,
  offset = 0,
): Promise<MultivariateTimeSeries> {
  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m')
  url.searchParams.set('lat_lon', coordinates.latitude?.toString() + ',' + coordinates.longitude?.toString())
  REQUESTED_WEATHER_PARAMETERS.forEach((p) => url.searchParams.append('parameters', p))
  url.searchParams.set('start', DateTime.now().startOf('day').toISO())
  url.searchParams.set('forecast_offset', offset.toString())

  // TODO: this will fill up local storage with data from different locations
  const data = await useCache(url.toString(), async () => {
    const response = await fetch(url.toString())
    const data = (await response.json()) as TimeseriesForecastGeoJsonSerializer
    const referenceDatetime = DateTime.fromISO(data.reference_time as string)
    const expires = referenceDatetime.plus(meta.reftimeOffset).plus(meta.interval.mapUnits((x, _) => x * (1 + offset)))
    return { data, expires }
  })

  const parsedTimestamps = data.timestamps.map((t) => DateTime.fromISO(t as string))

  const configs: TimeSeriesConfig<(typeof REQUESTED_WEATHER_PARAMETERS)[number], keyof MultivariateTimeSeries>[] = [
    { outKey: 'temperature', inKey: 't2m', type: 'normal' },
    { outKey: 'precipitation_amount', inKey: 'rr_acc', type: 'accumulated' },
    { outKey: 'relative_humidity', inKey: 'rh2m', type: 'normal' },
    { outKey: 'pressure', inKey: 'sp', type: 'normal' },
    { outKey: 'cloud_coverage', inKey: 'tcc', type: 'normal', multiplier: 100 },
    { outKeyLength: 'wind_speed', outKeyAngle: 'wind_degrees', xKey: 'u10m', yKey: 'v10m', type: 'vector' },
    { outKeyLength: 'wind_speed_gust', outKeyAngle: 'wind_degrees_gust', xKey: 'ugust', yKey: 'vgust', type: 'vector' },
    // { outKey: 'symbol', inKey: 't2m', type: 'normal' },
    { outKey: 'cape', inKey: 'cape', type: 'normal' },
    { outKey: 'cin', inKey: 'cin', type: 'normal' },
    { outKey: 'grad', inKey: 'grad', type: 'normal' },
  ]

  return transformTimeSeries(
    parsedTimestamps,
    data.features[0].properties.parameters,
    configs,
    Duration.fromObject({ hour: 1 }),
  )
}
