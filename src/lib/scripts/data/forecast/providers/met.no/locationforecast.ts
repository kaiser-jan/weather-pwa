import { defu } from 'defu'
import type { Coordinates, Forecast, ForecastDay, ForecastHour } from '$lib/types/data'
import type { ForecastTimeInstant, ForecastTimePeriod, ForecastTimeStep, MetjsonForecast } from '$lib/types/metno'
import { mapNumbersToStatisticalSummaries } from '$lib/scripts/data/forecast/utils'
import { useCache } from '../../cache'
import { DateTime } from 'luxon'

export async function loadMetnoLocationforecast(coords: Coordinates) {
  const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete.json')
  url.searchParams.set('lat', coords.latitude.toString())
  url.searchParams.set('lon', coords.longitude.toString())
  url.searchParams.set('altitude', coords.altitude.toFixed(0))
  const urlString = url.toString()

  const data = await useCache(urlString, async () => {
    const response = await fetch(urlString.toString())
    const data = (await response.json()) as MetjsonForecast
    // const referenceDatetime = DateTime.fromISO(data.properties.meta.updated_at as string)
    const expiresHeader = response.headers.get('expires')
    const expires = expiresHeader ? DateTime.fromHTTP(expiresHeader) : DateTime.now()
    return { data, expires }
  })
  console.log(data)

  return transform(data)
}

function transform(metnoResponse: MetjsonForecast): Pick<Forecast, 'hourly' | 'daily'> {
  const hourly: ForecastHour[] = []

  // create hourly forecasts from every timestep where instant and next_1_hours is available
  for (const timeStep of metnoResponse.properties.timeseries) {
    if (!timeStep.data.instant.details || !timeStep.data.next_1_hours) continue

    hourly.push({
      datetime: DateTime.fromISO(timeStep.time),
      ...transformTimePeriod(timeStep.data.next_1_hours.details),
      ...transformTimeInstant(timeStep.data.instant.details),
    } as ForecastHour)
  }

  // aggregate the timesteps available for each day for further processing
  const timestepsPerDay = new Map<string, ForecastTimeStep[]>()
  for (const timestep of metnoResponse.properties.timeseries) {
    // TODO: configurable timezone
    const dayString = DateTime.fromISO(timestep.time).toLocaleString(DateTime.DATE_SHORT)
    if (!timestepsPerDay.get(dayString)) timestepsPerDay.set(dayString, [])
    timestepsPerDay.get(dayString)!.push(timestep)
  }

  // BUG: Safari claims timestepsPerDay.values() is a map, so you cannot call .map on it
  const daily: ForecastDay[] = Array.from(timestepsPerDay.values())
    .map((dayTimesteps) => aggregateTimestepsForDay(dayTimesteps))
    .filter((d) => d !== null)

  return {
    hourly,
    daily,
  }
}

export function aggregateTimestepsForDay(timesteps: ForecastTimeStep[]): ForecastDay | null {
  const transformedInstants = timesteps
    .filter((t) => t.data.instant.details !== undefined)
    .map((t) => transformTimeInstant(t.data.instant.details!))

  const instantBased = mapNumbersToStatisticalSummaries(transformedInstants)
  if (!instantBased) return null

  // NOTE: collect all timesteps which do not overlap with the next day
  const timeperiodsNext1Hours = timesteps.map((t) => t.data.next_1_hours?.details)
  const timeperiodsNext6Hours = timesteps.map((t) =>
    DateTime.fromISO(t.time).hour <= 24 - 6 ? t.data.next_6_hours?.details : undefined,
  )
  const timeperiodsNext12Hours = timesteps.map((t) =>
    DateTime.fromISO(t.time).hour <= 24 - 12 ? t.data.next_12_hours?.details : undefined,
  )
  const timeperiods = [
    ...timeperiodsNext1Hours, //
    ...timeperiodsNext6Hours,
    ...timeperiodsNext12Hours,
  ].filter((v) => v !== undefined)

  if (timeperiods.length === 0) return null

  const timestepBased = mapNumbersToStatisticalSummaries(timeperiods)

  const datetime = DateTime.fromISO(timesteps[0].time)
  datetime.set({ hour: 0 })

  // NOTE: at the end of the current day we need instant based data
  // -> timestepBased overlaps to the next day
  return {
    // TODO: does it even make sense to use instant based data for timesteps?
    // e.g. cloud coverage from an instant doesn't really tell a lot about the following hours
    ...defu(instantBased, {
      temperature: {
        min: timestepBased.air_temperature_min?.min,
        max: timestepBased.air_temperature_min?.max,
      },
      uvi_clear_sky: {
        max: Math.max(timestepBased.ultraviolet_index_clear_sky_max?.max, instantBased.uvi_clear_sky?.max),
      },
      precipitation_amount: {
        sum: timestepBased.precipitation_amount?.sum,
        max: timestepBased.precipitation_amount_max?.max ?? timestepBased.precipitation_amount.max,
      },
      precipitation_probability: { sum: timestepBased.probability_of_precipitation?.sum },
      thunder_probability: { sum: timestepBased.probability_of_thunder?.sum },
      datetime,
      symbol: undefined,
    }),
  }
}

function percentageToFraction(value: number | undefined) {
  if (value === undefined) return undefined
  return value / 100
}

function transformTimeInstant(instant: ForecastTimeInstant): Partial<ForecastHour> {
  return {
    temperature: instant.air_temperature,
    pressure: instant.air_pressure_at_sea_level,
    relative_humidity: instant.relative_humidity,
    uvi_clear_sky: (instant as any).ultraviolet_index_clear_sky,
    cloud_coverage: percentageToFraction(instant.cloud_area_fraction),
    cloud_coverage_low: percentageToFraction(instant.cloud_area_fraction_low),
    cloud_coverage_medium: percentageToFraction(instant.cloud_area_fraction_medium),
    cloud_coverage_high: percentageToFraction(instant.cloud_area_fraction_high),
    fog: instant.fog_area_fraction,
    wind_speed: instant.wind_speed,
    wind_speed_gust: instant.wind_speed_of_gust,
    wind_degrees: instant.wind_from_direction,
  }
}

function transformTimePeriod(period: ForecastTimePeriod): Partial<ForecastHour> {
  return {
    uvi_clear_sky: period.ultraviolet_index_clear_sky_max,
    precipitation_amount: period.precipitation_amount,
    precipitation_probability: period.probability_of_precipitation,
    thunder_probability: period.probability_of_thunder,
  }
}
