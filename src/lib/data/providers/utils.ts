import { CONFIG } from '$lib/config'
import type { ForecastValues, StatisticalNumberSummary } from '$lib/types/data'
import type { ForecastTimePeriodSummary, ForecastTimePeriod, ForecastValuesSummary } from '$lib/types/data'
import { DateTime, Duration } from 'luxon'

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

export function combineTimePeriodsToDailyForecast(timePeriods: ForecastTimePeriod[]) {
  // aggregate the timesteps available for each day for further processing
  const timePeriodsPerDayMap = new Map<string, ForecastTimePeriod[]>()
  for (const timePeriod of timePeriods) {
    // TODO: configurable timezone
    const dayString = timePeriod.datetime.toISODate()
    if (!timePeriodsPerDayMap.get(dayString)) timePeriodsPerDayMap.set(dayString, [])
    timePeriodsPerDayMap.get(dayString)!.push(timePeriod)
  }

  const timePeriodsPerDay = Array.from(timePeriodsPerDayMap.entries())

  // remove the last day if it is not complete
  const lastDay = timePeriodsPerDay[timePeriodsPerDay.length - 1]
  const lastTimePeriod = lastDay[1][lastDay.length - 1]
  const hasDataUntilMidnight =
    lastTimePeriod.datetime.plus(lastTimePeriod.duration) >= lastTimePeriod.datetime.endOf('day')
  if (!CONFIG.dashboard.daily.showIncompleteLastDay && !hasDataUntilMidnight) {
    delete timePeriodsPerDay[timePeriodsPerDay.length - 1]
  }

  const daily: ForecastTimePeriodSummary[] = timePeriodsPerDay
    .map(([_, dayTimesteps]) => ({
      ...mapNumbersToStatisticalSummaries(dayTimesteps),
      datetime: dayTimesteps[0].datetime.startOf('day'),
      duration: Duration.fromObject({ day: 1 }),
      symbol: undefined,
    }))
    .filter((d) => d !== null)

  return daily
}

export function forecastTotalFromDailyForecast(daily: ForecastTimePeriodSummary[]) {
  const total = combineStatisticalNumberSummaries(
    daily.map((d) => ({ ...d, datetime: undefined, symbol: undefined, duration: undefined })),
  ) as ForecastValuesSummary

  return total
}

export function currentFromTimePeriods(timePeriods: ForecastTimePeriod[]) {
  const firstFutureTimePeriodIndex = timePeriods.findIndex((h) => h.datetime > DateTime.now())
  const current = timePeriods[Math.max(0, firstFutureTimePeriodIndex - 1)] as ForecastValues
  return current
}
