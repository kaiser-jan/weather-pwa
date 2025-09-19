import type { ForecastParameter, NumberSummary, TimeBucketSummary } from '$lib/types/data'
import { sum } from '$lib/utils'

/**
 * Creates a total summary from the daily summaries.
 */
export function forecastTotalFromDailyForecast(daily: TimeBucketSummary[]): TimeBucketSummary | null {
  // @ts-expect-error
  const parameterSummaryMap: Record<ForecastParameter, Partial<NumberSummary>[]> = {}

  // collect all the summaries per parameter
  for (const day of daily) {
    for (const [parameter, summary] of Object.entries(day.summary)) {
      ;(parameterSummaryMap[parameter as ForecastParameter] ??= []).push(summary)
    }
  }

  // @ts-expect-error
  const total: Record<ForecastParameter, NumberSummary> = {}

  // for each parameter, create a new total summary
  for (const [parameter, _summaries] of Object.entries(parameterSummaryMap)) {
    const summaries = _summaries as NumberSummary[]

    total[parameter as ForecastParameter] = {
      min: Math.min(...summaries.map((v) => v.min)),
      max: Math.max(...summaries.map((v) => v.max)),
      sum: sum(summaries.map((v) => v.sum)),
      avg: sum(summaries.map((v) => v.avg)) / summaries.length,
    }
  }

  if (!daily.length) return null

  const first = daily[0]
  const last = daily[daily.length - 1]

  return {
    timestamp: first.timestamp,
    duration: last.timestamp + last.duration - first.timestamp,
    summary: total,
  }
}
