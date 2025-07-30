import type { Coordinates, ForecastParameter, MultivariateTimeSeries } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import { transformTimeSeries, type TimeSeriesConfig } from '$lib/utils/data'
import type { DatasetId } from '../datasets'
import inca from '../datasets/inca'
import type { Loader } from '$lib/types/data/providers'

export default {
  id: 'geosphere.at_inca-v1-1h-1km',
  name: 'INCA Analysis',
  url: 'https://data.hub.geosphere.at/dataset/inca-v1-1h-1km',
  datasetIds: ['geosphere.at_inca-v1-1h-1km'],
  load: loadTimeseriesForecast,
} as const satisfies Loader<DatasetId>

const REQUESTED_WEATHER_PARAMETERS = [
  'GL', // global radiation (W m-2)
  'P0', // mean sea level pressure (Pa)
  'RH2M', // relative humidity 2m above ground (percent)
  'RR', // 1-hour precipitation sum (kg m-2)
  'T2M', // air temperature 2m above ground (degree_Celsius)
  'TD2M', // dew point temperature 2m above ground (degree_Celsius)
  'UU', // wind speed in eastward direction (m s-1)
  'VV', // wind speed in northward direction (m s-1)
] as const satisfies string[]

export const configs: TimeSeriesConfig<(typeof REQUESTED_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'grad', inKey: 'GL', type: 'normal' },
  { outKey: 'pressure', inKey: 'P0', type: 'normal' },
  { outKey: 'relative_humidity', inKey: 'RH2M', type: 'normal' },
  { outKey: 'temperature', inKey: 'T2M', type: 'normal' },
  { outKey: 'precipitation_amount', inKey: 'RR', type: 'normal' },
  { outKeyLength: 'wind_speed', outKeyAngle: 'wind_degrees', xKey: 'UU', yKey: 'VV', type: 'vector' },
]

async function loadTimeseriesForecast(coordinates: Coordinates): Promise<MultivariateTimeSeries> {
  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/historical/inca-v1-1h-1km')
  url.searchParams.set('lat_lon', coordinates.latitude?.toString() + ',' + coordinates.longitude?.toString())
  REQUESTED_WEATHER_PARAMETERS.forEach((p) => url.searchParams.append('parameters', p))
  url.searchParams.set('start', DateTime.now().startOf('day').minus({ days: 1 }).toISO())
  url.searchParams.set('end', DateTime.now().toISO())

  const data = await useCache('geosphere.at_inca-v1-1h-1km' as DatasetId, { coordinates }, async () => {
    const response = await fetch(url.toString())
    // TODO: handle api errors and do not store those
    const data = (await response.json()) as TimeseriesForecastGeoJsonSerializer
    const expires = DateTime.now().endOf('hour')
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
