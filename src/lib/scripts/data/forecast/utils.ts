import type { ForecastDay, ForecastHour, StatisticalNumberSummary } from '$lib/types/data'

export function aggregateHours(hours: ForecastHour[]): ForecastDay | null {
  if (hours.length === 0) return null

  let day: Partial<ForecastDay> = {}

  const firstHour = hours[0]

  for (const key of Object.keys(firstHour)) {
    if (typeof firstHour[key as keyof typeof firstHour] !== 'number') continue

    // @ts-expect-error
    day[key as keyof typeof day] = calculateStatisticalNumberSummary(
      hours.map((h) => h[key as keyof typeof h] as number),
    )
  }

  return day as ForecastDay
}

export function calculateStatisticalNumberSummary(values: number[]): StatisticalNumberSummary {
  if (values.length === 0) return { min: Infinity, max: -Infinity, sum: 0, avg: NaN }

  const sum = values.reduce((acc, num) => acc + num, 0)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    sum,
    avg: sum / values.length,
  }
}
