import type { StatisticalNumberSummary } from '$lib/types/data'
import type { ForecastDay, ForecastHour, ForecastTimestep } from '$lib/types/data'

export function mapNumbersToStatisticalSummaries<KeyT extends string>(
  items: Partial<Record<KeyT, any>>[],
): Record<KeyT, StatisticalNumberSummary> {
  // @ts-expect-error
  let valuesMap: Record<KeyT, number[]> = {}
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value !== 'number') continue
      if (!(key in valuesMap)) valuesMap[key as KeyT] = []
      valuesMap[key as KeyT].push(value as number)
    }
  }

  // @ts-expect-error
  let results: Record<KeyT, StatisticalNumberSummary> = {}

  for (const [key, values] of Object.entries(valuesMap)) {
    results[key as KeyT] = calculateStatisticalNumberSummary(values as number[])
  }

  return results
}

export function combineStatisticalNumberSummaries<KeyT extends string>(
  items: Partial<Record<KeyT, Partial<StatisticalNumberSummary>>>[],
): Record<KeyT, StatisticalNumberSummary> | null {
  // @ts-expect-error
  let valuesMap: Record<KeyT, Partial<StatisticalNumberSummary>[]> = {}
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value !== 'object' || value === null) continue
      if (!(key in valuesMap)) valuesMap[key as KeyT] = []
      valuesMap[key as KeyT].push(value)
    }
  }

  // @ts-expect-error
  let results: Record<KeyT, StatisticalNumberSummary> = {}

  for (const [key, _values] of Object.entries(valuesMap)) {
    const values = _values as StatisticalNumberSummary[]

    results[key as KeyT] = {
      min: Math.min(...values.map((v) => v.min)),
      max: Math.max(...values.map((v) => v.max)),
      sum: sum(values.map((v) => v.sum)),
      avg: sum(values.map((v) => v.avg)) / values.length,
    }
  }

  return results
}

export function calculateStatisticalNumberSummary(values: number[]): StatisticalNumberSummary {
  if (values.length === 0) return { min: Infinity, max: -Infinity, sum: 0, avg: NaN }

  const _sum = sum(values)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    sum: _sum,
    avg: _sum / values.length,
  }
}

export function sum(numbers: (number | undefined)[]): number {
  return numbers
    .filter((num): num is number => num !== undefined)
    .reduce((accumulator, current) => accumulator + current, 0)
}

export function combineHourlyToDailyForecast(hourly: ForecastHour[]) {
  // aggregate the timesteps available for each day for further processing
  const hoursPerDay = new Map<string, ForecastHour[]>()
  for (const hour of hourly) {
    // TODO: configurable timezone
    const dayString = new Date(hour.datetime).toLocaleDateString('en-US', { timeZone: 'Europe/Vienna' })
    if (!hoursPerDay.get(dayString)) hoursPerDay.set(dayString, [])
    hoursPerDay.get(dayString)!.push(hour)
  }

  const daily: ForecastDay[] = Array.from(hoursPerDay.entries())
    .map(([datetime, dayTimesteps]) => {
      return { ...mapNumbersToStatisticalSummaries(dayTimesteps), datetime: new Date(datetime) }
    })
    .filter((d) => d !== null)

  return daily
}

export function forecastTotalFromDailyForecast(daily: ForecastDay[]) {
  const total = combineStatisticalNumberSummaries(
    daily.map((d) => {
      return { ...d, datetime: undefined }
    }),
  ) as ForecastTimestep

  return total
}

export function currentFromHourly(hourly: ForecastHour[]) {
  const firstFutureHourlyIndex = hourly.findIndex((h) => h.datetime > new Date())
  const current = hourly[Math.max(0, firstFutureHourlyIndex - 1)] as ForecastInstant
  return current
}
