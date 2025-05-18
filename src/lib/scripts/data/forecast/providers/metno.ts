import type { Coordinates, Forecast, ForecastDay, ForecastHour, StatisticalNumberSummary } from '$lib/types/data'
import type {
  ForecastTimeInstant,
  ForecastTimePeriod,
  ForecastTimeStep,
  MetjsonForecast as MetnoResponse,
} from '$lib/types/metno'
import { calculateStatisticalNumberSummary, mapNumbersToStatisticalSummaries, sum } from '../utils'

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
  const hourly: ForecastHour[] = []

  for (const timeStep of metnoResponse.properties.timeseries) {
    if (!timeStep.data.instant.details || !timeStep.data.next_1_hours) continue

    hourly.push({
      datetime: new Date(timeStep.time),
      ...transformTimePeriod(timeStep.data.next_1_hours.details),
      ...transformTimeInstant(timeStep.data.instant.details),
    } as ForecastHour)
  }

  const timestepsPerDay = new Map<string, ForecastTimeStep[]>()
  for (const timestep of metnoResponse.properties.timeseries) {
    // TODO: configurable timezone
    const dayString = new Date(timestep.time).toLocaleDateString('en-US', { timeZone: 'Europe/Vienna' })
    console.log(timestep.time)
    console.log(dayString)
    if (!timestepsPerDay.get(dayString)) timestepsPerDay.set(dayString, [])
    timestepsPerDay.get(dayString)!.push(timestep)
  }

  const daily: ForecastDay[] = []
  for (const dayTimesteps of timestepsPerDay.values()) {
    const resolutions = [1, 6, 12] as const
    const highestFullDayResolution =
      resolutions.find((res) => dayTimesteps.every((d) => d.data[`next_${res}_hours`])) || null
    if (!highestFullDayResolution) continue

    daily.push(aggregateTimesteps(dayTimesteps, highestFullDayResolution))
  }

  return {
    current: hourly[0],
    hourly,
    daily,
    total: mapNumbersToStatisticalSummaries(hourly)!,
  }
}

const defaultStatisticalNumberSummary: StatisticalNumberSummary = {
  min: NaN,
  max: NaN,
  avg: NaN,
  sum: NaN,
}

export function aggregateTimesteps(timesteps: ForecastTimeStep[], resolution: 1 | 6 | 12): ForecastDay {
  const transformedInstants = timesteps
    .filter((t) => t.data.instant.details !== undefined)
    .map((t) => transformTimeInstant(t.data.instant.details!))

  const instantBased = mapNumbersToStatisticalSummaries(transformedInstants)
  const relevantTimesteps = timesteps.map((t) => t.data[`next_${resolution}_hours`]?.details!)
  const timestepBased = mapNumbersToStatisticalSummaries(relevantTimesteps)

  if (!instantBased || !timestepBased) return null

  const datetime = new Date(timesteps[0].time)
  datetime.setHours(0, 0, 0, 0)

  const result: ForecastDay = {
    temperature: { ...defaultStatisticalNumberSummary },
    precipitation_amount: { ...defaultStatisticalNumberSummary },
    precipitation_probability: { ...defaultStatisticalNumberSummary },
    thunder_probability: { ...defaultStatisticalNumberSummary },
    uvi_clear_sky: { ...defaultStatisticalNumberSummary },
    ...instantBased,
    datetime: datetime,
  }

  applyStatisticalSummaryLimit(result.temperature!, timestepBased.air_temperature_min, 'min')
  applyStatisticalSummaryLimit(result.temperature!, timestepBased.air_temperature_max, 'max')
  if (timestepBased.precipitation_amount !== undefined) {
    result.precipitation_amount!.sum = sum(relevantTimesteps.map((t) => t.precipitation_amount))
  }
  applyStatisticalSummaryLimit(result.precipitation_amount!, timestepBased.precipitation_amount_min, 'min')
  applyStatisticalSummaryLimit(result.precipitation_amount!, timestepBased.precipitation_amount_max, 'max')
  if (timestepBased.probability_of_precipitation !== undefined) {
    result.precipitation_probability = calculateStatisticalNumberSummary(
      relevantTimesteps.map((t) => t.probability_of_precipitation).filter((v) => v !== undefined),
    )
  }
  if (timestepBased.probability_of_thunder !== undefined) {
    result.thunder_probability = calculateStatisticalNumberSummary(
      relevantTimesteps.map((t) => t.probability_of_thunder).filter((v) => v !== undefined),
    )
  }
  applyStatisticalSummaryLimit(result.uvi_clear_sky!, timestepBased.ultraviolet_index_clear_sky_max, 'max')

  return result
}

function applyStatisticalSummaryLimit(
  value: StatisticalNumberSummary,
  newValue: StatisticalNumberSummary | undefined,
  limit: 'min' | 'max',
) {
  if (newValue === undefined) return
  value[limit] = Math[limit](...[value.max, newValue.max].filter((v) => v !== undefined))
}

function transformTimeInstant(instant: ForecastTimeInstant): Partial<ForecastHour> {
  return {
    temperature: instant.air_temperature,
    pressure: instant.air_pressure_at_sea_level,
    relative_humidity: instant.relative_humidity,
    uvi_clear_sky: (instant as any).ultraviolet_index_clear_sky,
    cloud_coverage: instant.cloud_area_fraction,
    cloud_coverage_low: instant.cloud_area_fraction_low,
    cloud_coverage_medium: instant.cloud_area_fraction_medium,
    cloud_coverage_high: instant.cloud_area_fraction_high,
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
