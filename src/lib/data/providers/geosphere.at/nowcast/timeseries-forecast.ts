import type { Coordinates, ForecastTimePeriod } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import meta from './meta'

export const REQUESTED_WEATHER_PARAMETERS: (typeof meta.availableParameters)[number][] = [
  't2m', // Air temperature 2m above ground
  'rh2m', // Relative humidity 2m above ground
  'pt', // Precipitation type
  'rr', // Precipitation sum
  'ff', // 10m wind speed
  'fx', // 10m gust speed
  'dd', // 10m wind direction
  // 'td', // Dew point temperature 2m above ground
] as const

export async function loadGeosphereNowcastTimeseriesForecast(
  coordinates: Coordinates,
  offset = 0,
): Promise<ForecastTimePeriod[]> {
  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nowcast-v1-15min-1km')
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
      return data.features[0].properties.parameters[p].data[index + indexOffset] ?? undefined
    }

    hourly.push({
      datetime: DateTime.fromISO(timestamp),
      duration: Duration.fromObject({ minutes: 15 }),
      temperature: extractParameter('t2m'),
      relative_humidity: extractParameter('rh2m'),
      // TODO: precipitation type
      // NOTE: this is in 15min steps and we use hourly precipitation for consistency
      precipitation_amount: (extractParameter('rr') ?? 0) * 4,
      wind_speed: extractParameter('ff'),
      wind_degrees: extractParameter('dd'),
      wind_speed_gust: extractParameter('ff'),
    })
  }

  return hourly
}
