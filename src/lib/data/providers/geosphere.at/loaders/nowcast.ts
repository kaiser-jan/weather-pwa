import type { Coordinates, ForecastParameter, MultivariateTimeSeries } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import { transformTimeSeries, type TimeSeriesConfig } from '$lib/utils/data'
import type { DatasetId } from '../datasets'
import nowcast from '../datasets/nowcast'
import type { Loader } from '$lib/types/data/providers'

export default {
  id: 'geosphere.at_nowcast-v1-15min-1km',
  name: 'INCA Nowcast',
  url: 'https://data.hub.geosphere.at/dataset/nowcast-v1-15min-1km',
  datasetIds: ['geosphere.at_nowcast-v1-15min-1km'],
  load: loadTimeseriesForecast,
} as const satisfies Loader<DatasetId>

const REQUESTED_WEATHER_PARAMETERS = [
  't2m', // Air temperature 2m above ground
  'rh2m', // Relative humidity 2m above ground
  'pt', // Precipitation type
  'rr', // Precipitation sum
  'ff', // 10m wind speed
  'fx', // 10m gust speed
  'dd', // 10m wind direction
  // 'td', // Dew point temperature 2m above ground
] as const satisfies string[]

export const configs: TimeSeriesConfig<(typeof REQUESTED_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'temperature', inKey: 't2m', type: 'normal' },
  { outKey: 'relative_humidity', inKey: 'rh2m', type: 'normal' },
  { outKey: 'precipitation_amount', inKey: 'rr', type: 'normal', multiplier: 4 }, // * 4 to go from mm/15min to mm/h
  { outKey: 'wind_speed', inKey: 'ff', type: 'normal' },
  { outKey: 'wind_degrees', inKey: 'dd', type: 'normal' },
  { outKey: 'wind_speed_gust', inKey: 'fx', type: 'normal' },
]

async function loadTimeseriesForecast(coordinates: Coordinates, offset = 0): Promise<MultivariateTimeSeries> {
  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nowcast-v1-15min-1km')
  url.searchParams.set('lat_lon', coordinates.latitude?.toString() + ',' + coordinates.longitude?.toString())
  REQUESTED_WEATHER_PARAMETERS.forEach((p) => url.searchParams.append('parameters', p))
  url.searchParams.set('start', DateTime.now().startOf('day').toISO())
  url.searchParams.set('forecast_offset', offset.toString())

  const data = await useCache('geosphere.at_nowcast-v1-15min-1km' as DatasetId, { coordinates, offset }, async () => {
    const response = await fetch(url.toString())
    // TODO: handle api errors and do not store those
    const data = (await response.json()) as TimeseriesForecastGeoJsonSerializer
    const referenceDatetime = DateTime.fromISO(data.reference_time as string)
    const expires = referenceDatetime.plus(nowcast.offset!).plus(nowcast.interval!.mapUnits((x, _) => x * (1 + offset)))
    return { data, expires }
  })

  const parsedTimestamps = data.timestamps.map((t) => DateTime.fromISO(t as string).toMillis())

  return transformTimeSeries(
    parsedTimestamps,
    data.features[0].properties.parameters,
    configs,
    Duration.fromObject({ hour: 1 }).toMillis(),
  )
}
