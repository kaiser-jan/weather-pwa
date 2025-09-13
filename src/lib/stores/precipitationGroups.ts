import { derived, get } from 'svelte/store'
import { forecastStore } from './data'
import { NOW, NOW_MILLIS } from './now'
import { settings } from '$lib/settings/store'
import { Duration } from 'luxon'
import type { TimeSeries } from '$lib/types/data'

const settingDataForecastPrecipitation = settings.select((s) => s.data.forecast.precipitation)

export interface PrecipitationGroup {
  start: number
  end: number
  isEndOfData?: boolean
  amount: number
  amountAfterNow: number
  hasBreaks?: boolean
  timeseries: TimeSeries<number>
}

export const precipitationGroupsStore = derived(
  [forecastStore, NOW, settingDataForecastPrecipitation],
  ([forecast, now, settingDataForecastPrecipitation]) => {
    const precipitation_amount = forecast?.multiseries?.precipitation_amount
    if (!precipitation_amount) return []

    const groups: PrecipitationGroup[] = []
    let isInGroup = false

    for (const timeBucket of precipitation_amount) {
      const previousGroup = groups[groups.length - 1]

      if (timeBucket.value < settingDataForecastPrecipitation.threshold || timeBucket.value === 0) {
        if (!isInGroup) continue
        previousGroup.end = timeBucket.timestamp
        isInGroup = false
        continue
      }

      if (!isInGroup) {
        isInGroup = true
        const threshold = Duration.fromDurationLike(settingDataForecastPrecipitation.groupInterval)
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
      currentGroup.amount += timeBucket.value
      currentGroup.timeseries.push(timeBucket)
      if (timeBucket.timestamp + timeBucket.duration > get(NOW_MILLIS)) currentGroup.amountAfterNow += timeBucket.value
    }

    if (groups.length && !groups[groups.length - 1].end) {
      const lastPrecipitationAmount = precipitation_amount[precipitation_amount.length - 1]
      groups[groups.length - 1].end = lastPrecipitationAmount.timestamp + lastPrecipitationAmount.duration
      groups[groups.length - 1].isEndOfData = true
    }

    return groups
  },
)
