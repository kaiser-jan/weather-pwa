import type { Coordinates, ForecastHour } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { calculateVector } from '$lib/utils'
import { REQUESTED_WEATHER_PARAMETERS, type RequestedWeatherParameter } from './meta'
import { useCache } from '../../cache'
import { DateTime, Duration } from 'luxon'

const MODEL_REFTIME_DELTA = Duration.fromObject({ hours: 6 })

export async function loadGeosphereForecastHourly(coordinates: Coordinates): Promise<ForecastHour[]> {
  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m')
  url.searchParams.set('lat_lon', coordinates.latitude?.toString() + ',' + coordinates.longitude?.toString())
  REQUESTED_WEATHER_PARAMETERS.forEach((p) => url.searchParams.append('parameters', p))
  const urlString = url.toString()

  // TODO: this will fill up local storage with data from different locations
  const data = await useCache(urlString, async () => {
    const response = await fetch(urlString.toString())
    const data = (await response.json()) as TimeseriesForecastGeoJsonSerializer
    const referenceDatetime = DateTime.fromISO(data.reference_time as string)
    const expires = referenceDatetime.plus(MODEL_REFTIME_DELTA)
    return { data, expires }
  })

  const hourly: ForecastHour[] = []

  for (const [index, timestamp] of (data.timestamps as string[]).entries()) {
    const extractParameter = (p: RequestedWeatherParameter, indexOffset = 0) => {
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
      datetime: new Date(timestamp),
      temperature: extractParameter('t2m'),
      precipitation_amount: extractParameter('rr_acc')
        ? Math.max(extractParameter('rr_acc')! - (extractParameter('rr_acc', -1) ?? 0), 0)
        : undefined,
      relative_humidity: extractParameter('rh2m'),
      pressure: extractParameter('sp'),
      cloud_coverage: extractParameter('tcc'),
      wind_speed,
      wind_degrees,
      // TODO: different angle for gust
      wind_speed_gust,
    })
  }

  return hourly
}
