import type { Coordinates, ForecastTimePeriod } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { calculateVector } from '$lib/utils'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import { symbolToWeatherSituationMap } from '../symbols'
import meta from './meta'

export const REQUESTED_WEATHER_PARAMETERS: (typeof meta.availableParameters)[number][] = [
  // 'cape',
  // 'cin',
  // 'grad',
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
): Promise<ForecastTimePeriod[]> {
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

  const hourly: ForecastTimePeriod[] = []

  for (const [index, timestamp] of (data.timestamps as string[]).entries()) {
    const extractParameter = (p: (typeof REQUESTED_WEATHER_PARAMETERS)[number], indexOffset = 0) => {
      // TODO: why is features an array?
      return data.features[0].properties.parameters[p].data[index + indexOffset] ?? undefined
    }

    const { value: wind_speed, angleDeg: wind_degrees } = calculateVector(
      extractParameter('u10m'),
      extractParameter('v10m'),
    )
    const { value: wind_speed_gust, angleDeg: wind_degrees_gust } = calculateVector(
      extractParameter('ugust'),
      extractParameter('vgust'),
    )

    // NOTE: contrary to the description, _acc values seem to be accumulated over the forecast period
    hourly.push({
      datetime: DateTime.fromISO(timestamp),
      duration: Duration.fromObject({ hour: 1 }),
      temperature: extractParameter('t2m'),
      // TODO: rr_acc is null for the first hour - why?
      // Is this an internal error or does rr_acc represent accumulated precipitation until this timestamp?
      precipitation_amount: Math.max(extractParameter('rr_acc') ?? 0 - (extractParameter('rr_acc', -1) ?? 0), 0),
      relative_humidity: extractParameter('rh2m'),
      pressure: extractParameter('sp'),
      cloud_coverage: extractParameter('tcc'),
      wind_speed,
      wind_degrees,
      // TODO: different angle for gust
      wind_speed_gust,
      symbol: extractParameter('sy') ? symbolToWeatherSituationMap[extractParameter('sy')!] : undefined,
    })
  }

  return hourly
}
