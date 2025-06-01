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

/**
 * Given a list of time periods, this ensures that there is no overlap between time periods.
 * Uses the smallest possible time periods, filling in gaps with the larger time periods.
 * NOTE: Cannot fill in gaps in time periods of equal duration, is meant to be used with continous time periods of equal length.
 */
export function unifyTimePeriods(timePeriods: ForecastTimePeriod[]) {
  // sort by duration ascending, then by datetime
  timePeriods.sort((a, b) => {
    if (a.duration.equals(b.duration)) return a.datetime.toMillis() - b.datetime.toMillis()
    return a.duration.as('milliseconds') - b.duration.as('milliseconds')
  })
  // console.log(timePeriods.map((tp) => tp.datetime.toISO() + ' ' + tp.duration.toISOTime()).join('\n'))

  let result: ForecastTimePeriod[] = []
  for (const timePeriod of timePeriods) {
    const overlap = result.filter(
      (tp) =>
        tp.datetime < timePeriod.datetime.plus(timePeriod.duration) &&
        tp.datetime.plus(tp.duration) > timePeriod.datetime &&
        tp.duration < timePeriod.duration,
    )

    const firstOverlap = overlap.length ? overlap[0] : undefined
    const lastOverlap = overlap.length ? overlap[overlap.length - 1] : undefined

    // add the item directly if it has no overlap
    if (!firstOverlap && !lastOverlap) {
      result.push(timePeriod)
      continue
    }

    // add in a filler before the first overlapping item
    if (firstOverlap && firstOverlap.datetime > timePeriod.datetime) {
      result.push({
        ...timePeriod,
        duration: firstOverlap.datetime.diff(timePeriod.datetime),
      })
    }

    // add in a filler after the last overlapping item
    if (
      lastOverlap &&
      lastOverlap.datetime.plus(lastOverlap.duration) < timePeriod.datetime.plus(timePeriod.duration)
    ) {
      result.push({
        ...timePeriod,
        datetime: lastOverlap.datetime.plus(lastOverlap.duration),
        duration: timePeriod.datetime.plus(timePeriod.duration).diff(lastOverlap.datetime.plus(lastOverlap.duration)),
      })
    }

    // add missing values
    for (let overlapIndex = 0; overlapIndex < overlap.length; overlapIndex++) {
      const overlapItem = overlap[overlapIndex]
      const resultsOverlapIndex = overlap.findIndex((o) => o.datetime.equals(overlapItem.datetime))
      result[resultsOverlapIndex] = { ...timePeriod, ...result[overlapIndex] }
    }
  }

  result = result.sort((a, b) => a.datetime.toMillis() - b.datetime.toMillis())
  // console.log(result.map((tp) => tp.datetime.toISO() + ' ' + tp.duration.toISOTime()).join('\n'))
  return result
}
