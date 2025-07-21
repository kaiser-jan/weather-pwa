import { derived } from 'svelte/store'
import { forecastStore } from './data'
import { NOW } from './now'
import { settings } from '$lib/settings/store'
import { Duration, type DateTime } from 'luxon'

const settingDataForecastPrecipitation = settings.select((s) => s.data.forecast.precipitation)

export interface PrecipitationGroup {
  start: DateTime
  end: DateTime
  amount: number
  sporadic?: boolean
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
        previousGroup.end = timeBucket.datetime
        isInGroup = false
        continue
      }

      if (!isInGroup) {
        isInGroup = true
        const threshold = Duration.fromDurationLike(settingDataForecastPrecipitation.groupInterval)
        const isSporadic = previousGroup && timeBucket.datetime.diff(previousGroup.end) < threshold

        if (isSporadic) {
          // continue this group
          previousGroup.sporadic = true
        } else {
          // start a new group
          groups.push({ start: timeBucket.datetime, amount: 0 } as PrecipitationGroup)
        }
      }

      // ensure precipitation from the past is omitted
      const currentGroup = groups[groups.length - 1]
      if (timeBucket.datetime < now) {
        currentGroup.amount = timeBucket.value
      } else {
        currentGroup.amount += timeBucket.value
      }
    }

    return groups
  },
)
