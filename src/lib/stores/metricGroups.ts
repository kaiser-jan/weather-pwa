import { derived, get } from 'svelte/store'
import { forecastStore } from './data'
import { NOW, NOW_MILLIS } from './now'
import type { Forecast, ForecastParameter, TimeSeries } from '$lib/types/data'
import { DateTime, Duration } from 'luxon'
import { groupMultiseriesByDay } from '$lib/utils/forecast/daily'

export interface MetricGroup {
  start: number
  end: number
  avg: number
  rollingAvg: number
  timeseries: TimeSeries<number>
}

export const metricGroupsStore = derived([forecastStore, NOW], ([forecast, _]) => ({
  cloud_coverage: groupMetric('cloud_coverage', forecast),
}))

function caculateAvgDelta(values: number[]): number {
  if (values.length < 2) return 0

  let sum = 0
  for (let i = 1; i < values.length; i++) {
    sum += values[i] - values[i - 1]
  }
  return sum / (values.length - 1)
}

function groupMetric(parameter: ForecastParameter, forecast: Forecast | null) {
  const series = forecast?.multiseries?.[parameter]
  if (!series) return []

  const groups: MetricGroup[] = []

  groups.push({
    start: series[0].timestamp,
    end: series[0].timestamp,
    timeseries: [],
    rollingAvg: series[0].value,
    avg: series[0].value,
  })

  const days = groupMultiseriesByDay({ [parameter]: series })

  for (let i = 1; i < series.length; i++) {
    const timeBucket = series[i]
    const previousGroup = groups[groups.length - 1]
    const previousItem = previousGroup ? previousGroup.timeseries[previousGroup.timeseries.length - 1] : undefined
    const currentDay = days.findLast((d) => d.timestamp < timeBucket.timestamp)
    const currentDayAvgDelta = caculateAvgDelta(currentDay!.series[parameter]!.map((i) => i.value))

    const avgDelta = Math.abs(timeBucket.value - previousGroup.avg)
    const rollingAvgDelta = Math.abs(timeBucket.value - previousGroup.rollingAvg)
    const main = Math.max(currentDayAvgDelta * 6, 25)
    const secondary = Math.max(Math.min(currentDayAvgDelta * 6, 30), 20)
    const isDeltaLarge = avgDelta > main || rollingAvgDelta > secondary

    const isGroupLongEnough = previousItem
      ? previousItem.timestamp + previousItem.duration - previousGroup.timeseries[0].timestamp >
        Duration.fromObject({ hours: 2 }).toMillis()
      : false

    // TODO: finetune
    if (isDeltaLarge && isGroupLongEnough) {
      previousGroup.end = timeBucket.timestamp

      groups.push({
        start: timeBucket.timestamp,
        end: timeBucket.timestamp,
        timeseries: [],
        rollingAvg: timeBucket.value,
        avg: timeBucket.value,
      })
    }

    const currentGroup = groups[groups.length - 1]
    currentGroup.timeseries.push(timeBucket)
    currentGroup.rollingAvg = (currentGroup.rollingAvg + 2 * timeBucket.value) / 3
    currentGroup.avg =
      currentGroup.timeseries.map((i) => i.value).reduce((p, c) => p + c) / currentGroup.timeseries.length
  }

  if (groups.length && !groups[groups.length - 1].end) {
    const lastOccurence = series[series.length - 1]
    groups[groups.length - 1].end = lastOccurence.timestamp + lastOccurence.duration
  }

  const filteredGroups: MetricGroup[] = []

  for (let i = 0; i < groups.length; i++) {
    const lastGroup = groups[i - 1]
    const currentGroup = groups[i]

    if (lastGroup && Math.abs(currentGroup.avg - lastGroup.avg) <= 10) {
      const lastGroup = filteredGroups[filteredGroups.length - 1]
      if (!lastGroup) continue
      lastGroup.end = currentGroup.end
      lastGroup.timeseries = [...lastGroup.timeseries, ...currentGroup.timeseries]
    } else {
      filteredGroups.push(currentGroup)
    }
  }

  return filteredGroups
}
