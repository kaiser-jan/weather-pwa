import type {
  Forecast,
  MultivariateTimeSeries,
  MultivariateTimeSeriesTimeBucket,
  NumberSummary,
  ForecastParameter,
} from '$lib/types/data'
import type { TimeBucketSummary } from '$lib/types/data'
import { DateTime, Duration } from 'luxon'

export function combineStatisticalNumberSummaries<KeyT extends string>(
  items: Partial<Record<KeyT, Partial<NumberSummary>>>[],
): Record<KeyT, NumberSummary> {
  const valuesMap: Record<KeyT, Partial<NumberSummary>[]> = {} as Record<KeyT, Partial<NumberSummary>[]>
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value !== 'object' || value === null) continue
      if (!(key in valuesMap)) valuesMap[key as KeyT] = []
      valuesMap[key as KeyT].push(value)
    }
  }

  const results: Record<KeyT, NumberSummary> = {} as Record<KeyT, NumberSummary>

  for (const [key, _values] of Object.entries(valuesMap)) {
    const values = _values as NumberSummary[]

    results[key as KeyT] = {
      min: Math.min(...values.map((v) => v.min)),
      max: Math.max(...values.map((v) => v.max)),
      sum: sum(values.map((v) => v.sum)),
      avg: sum(values.map((v) => v.avg)) / values.length,
    }
  }

  return results
}

export function calculateStatisticalNumberSummary(values: number[]): NumberSummary {
  if (values.length === 0) return { min: Infinity, max: -Infinity, sum: 0, avg: NaN }

  const _sum = sum(values)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    // TODO: this needs to respect the duration of the TimePeriod
    // e.g. for precipitation, we cant just add the mm/h when some TimePeriods are shorter!
    sum: _sum,
    avg: sum(values) / values.length,
  }
}

export function sum(numbers: (number | undefined)[]): number {
  return numbers
    .filter((num): num is number => num !== undefined)
    .reduce((accumulator, current) => accumulator + current, 0)
}

export function groupMultiseriesByDay(multiseries: MultivariateTimeSeries): MultivariateTimeSeriesTimeBucket[] {
  const groupedMap: Record<string, MultivariateTimeSeriesTimeBucket> = {}

  for (const [parameter, series] of Object.entries(multiseries)) {
    for (const item of series) {
      const day = item.datetime.toISODate()!
      if (!groupedMap[day])
        groupedMap[day] = {
          datetime: item.datetime.startOf('day'),
          duration: Duration.fromObject({ hours: 24 }),
          series: {},
        }

      const parameterTyped = parameter as keyof MultivariateTimeSeries
      if (!groupedMap[day].series[parameterTyped]) groupedMap[day].series[parameterTyped] = [] as any[]
      groupedMap[day].series[parameterTyped]!.push(item)
    }
  }

  const grouped = Object.values(groupedMap)

  // add one item from the neighboring day at each
  for (let i = 1; i < grouped.length; i++) {
    for (const key of Object.keys(grouped[i].series)) {
      const keyTyped = key as ForecastParameter
      const previousSeries = grouped[i - 1].series[keyTyped]
      const currentSeries = grouped[i].series[keyTyped]
      if (!previousSeries || !currentSeries) continue
      const lastItemPrevious = previousSeries[previousSeries.length - 1]
      const firstItemCurrent = currentSeries[0]
      const startOfDay = firstItemCurrent.datetime.startOf('day')
      if (lastItemPrevious.datetime.plus(lastItemPrevious.duration) > startOfDay) {
        currentSeries.unshift({
          value: lastItemPrevious.value,
          datetime: startOfDay,
          duration: firstItemCurrent.datetime.diff(startOfDay),
        })
      }
      previousSeries.push(currentSeries[0])
    }
  }

  const groupedCompleteOnly = grouped.filter((g) => {
    if (!g.series.temperature?.length) return true

    // HACK: how to determine whether a day is complete?
    const lastTemperatureItem = g.series.temperature[g.series.temperature.length - 1]
    const temperatureEndDateTime = lastTemperatureItem.datetime.plus(lastTemperatureItem.duration)
    const isIncomplete = temperatureEndDateTime.startOf('day').equals(g.series.temperature[0].datetime.startOf('day'))
    if (isIncomplete) return false
    return true
  })

  return groupedCompleteOnly
}

export function combineMultiseriesToDailyForecast(multiserIes: MultivariateTimeSeries): Forecast['daily'] {
  const grouped = groupMultiseriesByDay(multiserIes)

  return grouped.map((day) => ({
    datetime: day.datetime,
    duration: day.duration,
    summary: mapRecord(day.series, (s) => calculateStatisticalNumberSummary(s.map((tp) => tp.value))),
    multiseries: day.series,
  }))
}

function mapRecord<KeyT extends string, ItemT, TargetT>(
  input: Partial<Record<KeyT, ItemT[]>>,
  fn: (arr: ItemT[]) => TargetT,
): Record<KeyT, TargetT> {
  const result = {} as Record<KeyT, TargetT>
  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      result[key as KeyT] = fn(input[key]!)
    }
  }
  return result
}

export function forecastTotalFromDailyForecast(daily: TimeBucketSummary[]): TimeBucketSummary {
  const total = combineStatisticalNumberSummaries(daily.map((d) => d.summary))

  if (!daily.length) return null

  const first = daily[0]
  const last = daily[daily.length - 1]

  return {
    datetime: daily[0].datetime,
    duration: last.datetime.plus(last.duration).diff(first.datetime),
    summary: total,
  }
}

export function currentFromMultiseries(multiseries: MultivariateTimeSeries, datetime: DateTime) {
  // retrieves the last value before DateTime.now() for each series
  const current: Forecast['current'] = {}
  Object.entries(multiseries).forEach(([key, series]) => {
    current[key as keyof typeof current] = series.findLast((tp) => tp.datetime < datetime)?.value
  })
  return current
}
