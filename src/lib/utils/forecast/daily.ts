import { NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
import type {
  Forecast,
  MultivariateTimeSeries,
  MultivariateTimeSeriesTimeBucket,
  NumberSummary,
  ForecastParameter,
} from '$lib/types/data'
import { getEndOfDayTimestamp, getStartOfDayTimestamp, mapRecord, sum } from '$lib/utils'
import { Duration } from 'luxon'
import { get } from 'svelte/store'

/**
 * Calculate statistically relevant properties for the given number list.
 * - Minimum
 * - Maximum
 * - Average
 * - Sum
 */
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

/**
 * Creates a list of day-timebuckets with their part of the multiseries.
 * Ensures that all data relevant for a day is present, including items which span across multiple days
 */
export function groupMultiseriesByDay(multiseries: MultivariateTimeSeries): MultivariateTimeSeriesTimeBucket[] {
  const groupedMap: Record<number, MultivariateTimeSeriesTimeBucket> = {}

  // iterate over each series and its items and assign them to the correct day bucket
  for (const [parameter, series] of Object.entries(multiseries)) {
    for (const item of series) {
      const dayStartTimestamp = getStartOfDayTimestamp(item.timestamp)
      // initiate the timebucket
      if (!groupedMap[dayStartTimestamp]) {
        groupedMap[dayStartTimestamp] = {
          timestamp: dayStartTimestamp,
          duration: Duration.fromObject({ hours: 24 }).toMillis(),
          series: {},
        }
      }

      const parameterTyped = parameter as keyof MultivariateTimeSeries
      // create the series on the timebucket
      if (!groupedMap[dayStartTimestamp].series[parameterTyped]) {
        groupedMap[dayStartTimestamp].series[parameterTyped] = [] as any[]
      }
      // add the item to the timebuckets series
      groupedMap[dayStartTimestamp].series[parameterTyped]!.push(item)
    }
  }

  const grouped = Object.values(groupedMap).sort((a, b) => a.timestamp - b.timestamp)

  // add one item from the neighboring day at each
  for (let i = 1; i < grouped.length; i++) {
    // for each series
    for (const key of Object.keys(grouped[i].series)) {
      const keyTyped = key as ForecastParameter

      const previousGroupSeries = grouped[i - 1].series[keyTyped]
      const currentGroupSeries = grouped[i].series[keyTyped]
      if (!previousGroupSeries || !currentGroupSeries) continue

      const lastItemPrevious = previousGroupSeries[previousGroupSeries.length - 1]
      const firstItemCurrent = currentGroupSeries[0]

      const startOfDayTimestamp = getStartOfDayTimestamp(firstItemCurrent.timestamp)

      // if the last item of the previous group overlaps the current group, add it
      if (lastItemPrevious.timestamp + lastItemPrevious.duration > startOfDayTimestamp) {
        currentGroupSeries.unshift({
          value: lastItemPrevious.value,
          timestamp: startOfDayTimestamp,
          duration: firstItemCurrent.timestamp - startOfDayTimestamp,
        })
      }

      // add the first item of the current group to the end of the previous group
      previousGroupSeries.push(currentGroupSeries[0])
    }
  }

  // TODO: refactor: mark the incomplete items instead of removing them
  // Completeness doesn't matter e.g. for a chart, but does matter for a daily summary.
  const groupedCompleteOnly = grouped.filter((g) => {
    if (!g.series.temperature?.length) return true

    // HACK: how to determine whether a day is complete? currently using temperature
    const firstTemperatureItem = g.series.temperature[0]

    // use any past data
    if (firstTemperatureItem.timestamp <= getStartOfDayTimestamp(get(NOW_MILLIS))) return true

    const lastTemperatureItem = g.series.temperature[g.series.temperature.length - 1]
    const temperatureEndTimestamp = lastTemperatureItem.timestamp + lastTemperatureItem.duration

    const isMissingEnd = temperatureEndTimestamp < getEndOfDayTimestamp(firstTemperatureItem.timestamp)
    const isMissingStart = firstTemperatureItem.timestamp > getStartOfDayTimestamp(firstTemperatureItem.timestamp)

    if ((isMissingStart && g.timestamp !== get(TODAY_MILLIS)) || isMissingEnd) return false
    return true
  })

  return groupedCompleteOnly
}

/**
 * Creates daily summaries from the given multiseries.
 */
export function combineMultiseriesToDailyForecast(multiseries: MultivariateTimeSeries): Forecast['daily'] {
  const grouped = groupMultiseriesByDay(multiseries)

  return grouped.map((day) => ({
    timestamp: day.timestamp,
    duration: day.duration,
    summary: mapRecord(day.series, (s) => calculateStatisticalNumberSummary(s.map((tp) => tp.value))),
    multiseries: day.series,
  }))
}
