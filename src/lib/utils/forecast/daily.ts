import { NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
import type {
  Forecast,
  MultivariateTimeSeries,
  MultivariateTimeSeriesTimeBucket,
  NumberSummary,
  ForecastParameter,
  TimeBucketSummary,
  TimeBucket,
} from '$lib/types/data'
import { getEndOfDayTimestamp, getStartOfDayTimestamp, mapRecord, sum } from '$lib/utils'
import { DateTime, Duration } from 'luxon'
import { get } from 'svelte/store'

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

export function groupMultiseriesByDay(multiseries: MultivariateTimeSeries): MultivariateTimeSeriesTimeBucket[] {
  const groupedMap: Record<number, MultivariateTimeSeriesTimeBucket> = {}

  for (const [parameter, series] of Object.entries(multiseries)) {
    for (const item of series) {
      const dayStartTimestamp = getStartOfDayTimestamp(item.timestamp)
      if (!groupedMap[dayStartTimestamp])
        groupedMap[dayStartTimestamp] = {
          timestamp: dayStartTimestamp,
          duration: Duration.fromObject({ hours: 24 }).toMillis(),
          series: {},
        }

      const parameterTyped = parameter as keyof MultivariateTimeSeries
      if (!groupedMap[dayStartTimestamp].series[parameterTyped])
        groupedMap[dayStartTimestamp].series[parameterTyped] = [] as any[]
      groupedMap[dayStartTimestamp].series[parameterTyped]!.push(item)
    }
  }

  const grouped = Object.values(groupedMap).sort((a, b) => a.timestamp - b.timestamp)

  // add one item from the neighboring day at each
  for (let i = 1; i < grouped.length; i++) {
    for (const key of Object.keys(grouped[i].series)) {
      const keyTyped = key as ForecastParameter
      const previousSeries = grouped[i - 1].series[keyTyped]
      const currentSeries = grouped[i].series[keyTyped]
      if (!previousSeries || !currentSeries) continue
      const lastItemPrevious = previousSeries[previousSeries.length - 1]
      const firstItemCurrent = currentSeries[0]
      const startOfDayTimestamp = getStartOfDayTimestamp(firstItemCurrent.timestamp)
      if (lastItemPrevious.timestamp + lastItemPrevious.duration > startOfDayTimestamp) {
        currentSeries.unshift({
          value: lastItemPrevious.value,
          timestamp: startOfDayTimestamp,
          duration: firstItemCurrent.timestamp - startOfDayTimestamp,
        })
      }
      previousSeries.push(currentSeries[0])
    }
  }

  const groupedCompleteOnly = grouped.filter((g) => {
    if (!g.series.temperature?.length) return true

    // HACK: how to determine whether a day is complete?
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

export function combineMultiseriesToDailyForecast(multiseries: MultivariateTimeSeries): Forecast['daily'] {
  const grouped = groupMultiseriesByDay(multiseries)

  return grouped.map((day) => ({
    timestamp: day.timestamp,
    duration: day.duration,
    summary: mapRecord(day.series, (s) => calculateStatisticalNumberSummary(s.map((tp) => tp.value))),
    multiseries: day.series,
  }))
}
