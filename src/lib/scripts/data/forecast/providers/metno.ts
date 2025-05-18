import type { Coordinates, Forecast } from '$lib/types/data'
import type { ForecastTimeStep as MetnoForecastTimeStep, MetjsonForecast as MetnoResponse } from '$lib/types/metno'
import { aggregateHours } from '../utils'

export async function loadMetnoLocationforecast(coords: Coordinates) {
  const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete.json')
  url.searchParams.set('lat', coords.latitude?.toString())
  url.searchParams.set('lon', coords.longitude?.toString())
  url.searchParams.set('altitude', coords.altitude?.toString())

  const response = await fetch(url.toString())
  const data = (await response.json()) as MetnoResponse
  return transform(data)
}

function transform(metnoResponse: MetnoResponse): Forecast {
  const hourly = metnoResponse.properties.timeseries.map(_timestepToHour).filter((v) => v !== null)

  const hoursPerDay = new Map<string, Forecast['hourly']>()
  for (const hour of hourly) {
    const dayString = hour.datetime.toDateString()
    if (!hoursPerDay.get(dayString)) hoursPerDay.set(dayString, [])
    hoursPerDay.get(dayString)!.push(hour)
  }
  const daily = Array.from(hoursPerDay.values())
    .map(aggregateHours)
    .filter((v) => v !== null)

  return {
    current: hourly[0],
    hourly,
    daily,
  }
}

function _timestepToHour(timestep: MetnoForecastTimeStep): Forecast['hourly'][number] | null {
  const now = timestep.data.instant.details
  const hour = timestep.data.next_1_hours?.details

  if (!now || !hour) return null

  return {
    datetime: new Date(timestep.time),
    temperature: now.air_temperature,
    pressure: now.air_pressure_at_sea_level,
    relative_humidity: now.relative_humidity,
    uvi_clear_sky: hour.ultraviolet_index_clear_sky_max ?? (now as any).ultraviolet_index_clear_sky,
    cloud_coverage: now.cloud_area_fraction,
    cloud_coverage_low: now.cloud_area_fraction_low,
    cloud_coverage_medium: now.cloud_area_fraction_medium,
    cloud_coverage_high: now.cloud_area_fraction_high,
    fog: now.fog_area_fraction,
    wind_speed: now.wind_speed,
    wind_speed_gust: now.wind_speed_of_gust,
    wind_degrees: now.wind_from_direction,
    precipitation_amount: hour.precipitation_amount,
    precipitation_probability: hour.probability_of_precipitation,
    thunder_probability: hour.probability_of_thunder,
  }
}
