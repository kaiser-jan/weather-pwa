import type { Coordinates, ForecastParameter, MultivariateTimeSeries } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import { transformTimeSeries, type TimeSeriesConfig } from '$lib/utils/data'
import { type DatasetId } from '../datasets'
import type { Loader } from '$lib/types/data/providers'
import nwp from '../datasets/nwp'

export default {
  id: 'geosphere.at_nwp-v1-1h-2500m',
  url: 'https://data.hub.geosphere.at/dataset/nwp-v1-1h-2500m',
  datasetIds: ['geosphere.at_nwp-v1-1h-2500m'],
  load: loadTimeseriesForecast,
} as const satisfies Loader<DatasetId>

const REQUESTED_WEATHER_PARAMETERS: string[] = [
  'cape',
  'cin',
  'grad',
  'mnt2m',
  'mxt2m',
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

export const configs: TimeSeriesConfig<(typeof REQUESTED_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'temperature', inKey: 't2m', type: 'normal' },
  { outKey: 'temperature_min', inKey: 'mnt2m', type: 'normal' },
  { outKey: 'temperature_max', inKey: 'mxt2m', type: 'normal' },
  {
    outKey: 'precipitation_amount',
    inKey: 'rr_acc',
    type: 'accumulated-until',
    asDeltaPer: Duration.fromObject({ hours: 1 }),
  },
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

async function loadTimeseriesForecast(coordinates: Coordinates, offset = 0): Promise<MultivariateTimeSeries> {
  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m')
  url.searchParams.set('lat_lon', coordinates.latitude?.toString() + ',' + coordinates.longitude?.toString())
  REQUESTED_WEATHER_PARAMETERS.forEach((p) => url.searchParams.append('parameters', p))
  url.searchParams.set('start', DateTime.now().startOf('day').toISO())
  url.searchParams.set('forecast_offset', offset.toString())

  const data = await useCache('geosphere.at_nwp-v1-1h-2500m' as DatasetId, { coordinates, offset }, async () => {
    const response = await fetch(url.toString())
    const data = (await response.json()) as TimeseriesForecastGeoJsonSerializer
    const referenceDatetime = DateTime.fromISO(data.reference_time as string)
    const expires = referenceDatetime.plus(nwp.offset!).plus(nwp.interval!.mapUnits((x, _) => x * (1 + offset)))
    return { data, expires }
  })

  const parsedTimestamps = data.timestamps.map((t) => DateTime.fromISO(t as string))

  const transformed = transformTimeSeries(
    parsedTimestamps,
    data.features[0].properties.parameters,
    configs,
    Duration.fromObject({ hour: 1 }),
  )

  if (coordinates.altitude !== null) {
    transformed.pressure.forEach((v, i) => {
      const pressure = v.value
      const temperature = transformed.temperature[i].value
      if (pressure === null || temperature === null) return
      transformed.pressure[i].value = convertSurfacePressureToSeaLevel(pressure, coordinates.altitude!, temperature)
    })
  } else {
    // TODO: how can we handle this better? using an api like open-elevation means selfhosting the api or paying
    console.warn('No altitude available, cannot convert surface pressure to sea level pressure!')
    delete transformed['pressure']
  }

  return transformed
}

function convertSurfacePressureToSeaLevel(P: number, h: number, t: number): number {
  const g = 9.80665 // m/s²
  const M = 0.0289644 // kg/mol
  const R = 8.31432 // J/(mol·K)
  const L = 0.0065 // K/m (lapse rate)

  const T = t + 273.15

  const factor = (g * M) / (R * L)
  const base = 1 - (L * h) / T

  return P * Math.pow(base, -factor)
}
