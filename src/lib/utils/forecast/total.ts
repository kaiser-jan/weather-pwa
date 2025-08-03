import type { NumberSummary, TimeBucketSummary } from '$lib/types/data'
import { sum } from '$lib/utils'

function combineStatisticalNumberSummaries<KeyT extends string>(
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

export function forecastTotalFromDailyForecast(daily: TimeBucketSummary[]): TimeBucketSummary | null {
  const total = combineStatisticalNumberSummaries(daily.map((d) => d.summary))

  if (!daily.length) return null

  const first = daily[0]
  const last = daily[daily.length - 1]

  return {
    timestamp: daily[0].timestamp,
    duration: last.timestamp + last.duration - first.timestamp,
    summary: total,
  }
}
