import type { ForecastParameter, MultivariateTimeSeries } from '$lib/types/data'
import { Duration } from 'luxon'
import { NOW_MILLIS } from './now'
import { mapRecord } from '$lib/utils'
import { calculateStatisticalNumberSummary } from '$lib/utils/forecast/daily'
import { derived } from 'svelte/store'
import { forecastStore } from './data'

export const next24Hours = derived([forecastStore, NOW_MILLIS], ([forecast, now]) => {
  if (!forecast) return undefined

  const multiseries: MultivariateTimeSeries = {}
  const start = now
  const end = start + Duration.fromObject({ hours: 24 }).toMillis()

  for (const [parameter, series] of Object.entries(forecast.multiseries)) {
    const startIndex = series.findLastIndex((i) => i.timestamp < start)
    const endIndex = series.findLastIndex((i) => i.timestamp < end)
    multiseries[parameter as ForecastParameter] = series.slice(startIndex, endIndex)
  }

  return {
    timestamp: start,
    duration: end - start,
    summary: mapRecord(multiseries, (s) => calculateStatisticalNumberSummary(s.map((tp) => tp.value))),
    multiseries,
  }
})
