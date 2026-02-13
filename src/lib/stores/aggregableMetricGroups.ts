import { derived, get } from 'svelte/store'
import { forecastStore } from './data'
import { NOW, NOW_MILLIS } from './now'
import { settings } from '$lib/stores/settings'
import { DateTime, Duration, type DurationLike } from 'luxon'
import type { Forecast, ForecastParameter, TimeSeries } from '$lib/types/data'
import { mapRecord } from '$lib/utils'

const settingDataForecastPrecipitation = settings.select((s) => s.data.forecast.precipitation)

export interface AggregableMetricGroup {
  start: number
  end: number
  isEndOfData?: boolean
  amount: number
  amountAfterNow: number
  hasBreaks?: boolean
  timeseries: TimeSeries<number>
}

export const aggregableMetricGroupsStore = derived(
  [forecastStore, NOW, settingDataForecastPrecipitation],
  ([forecast, _, setting]) => ({
    precipitation_amount: groupAggregatableMetric(
      'precipitation_amount',
      forecast,
      setting.threshold,
      setting.groupInterval,
    ),
    rain_amount: groupAggregatableMetric('rain_amount', forecast, setting.threshold, setting.groupInterval),
    snow_amount: groupAggregatableMetric('snow_amount', forecast, 0, setting.groupInterval),
  }),
)

function groupAggregatableMetric(
  parameter: ForecastParameter,
  forecast: Forecast | null,
  threshold: number,
  groupInterval: DurationLike,
) {
  const series = forecast?.multiseries?.[parameter]
  if (!series) return []

  const groups: AggregableMetricGroup[] = []
  let isInGroup = false

  for (const timeBucket of series) {
    const previousGroup = groups[groups.length - 1]

    if (timeBucket.value < threshold || timeBucket.value === 0) {
      if (!isInGroup) continue
      previousGroup.end = timeBucket.timestamp
      isInGroup = false
      continue
    }

    if (!isInGroup) {
      isInGroup = true
      const threshold = Duration.fromDurationLike(groupInterval)
      const hasBreaks = previousGroup && timeBucket.timestamp - previousGroup.end < threshold.toMillis()

      if (hasBreaks) {
        // continue this group
        previousGroup.hasBreaks = true
      } else {
        // start a new group
        groups.push({
          start: timeBucket.timestamp,
          end: timeBucket.timestamp,
          amount: 0,
          amountAfterNow: 0,
          timeseries: [],
        })
      }
    }

    const currentGroup = groups[groups.length - 1]
    currentGroup.timeseries.push(timeBucket)
    // TODO: properly handle summing aggregated metrics
    const scaledAmount = timeBucket.value * (timeBucket.duration / 3_600_000)
    currentGroup.amount += scaledAmount
    if (timeBucket.timestamp + timeBucket.duration > get(NOW_MILLIS)) currentGroup.amountAfterNow += scaledAmount
  }

  if (groups.length && !groups[groups.length - 1].end) {
    const lastOccurence = series[series.length - 1]
    groups[groups.length - 1].end = lastOccurence.timestamp + lastOccurence.duration
    groups[groups.length - 1].isEndOfData = true
  }

  return groups
}

export const aggregableMetricGroupsUpcomingStore = derived([aggregableMetricGroupsStore, NOW], ([groupsRecord, now]) =>
  mapRecord(groupsRecord, (groups) => {
    // show at least the next x hours
    const minHours = 8
    const relevantEndDatetime =
      now.hour <= 24 - minHours ? now.endOf('day') : now.plus(Duration.fromObject({ hours: minHours }))
    return groups.filter((g) => g.end > now.toMillis() && g.start <= relevantEndDatetime.toMillis())
  }),
)
