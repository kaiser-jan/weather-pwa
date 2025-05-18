import type { ForecastDay, ForecastHour, StatisticalNumberSummary } from '$lib/types/data'

export function mapNumbersToStatisticalSummaries<KeyT extends string>(
  items: Partial<Record<KeyT, any>>[],
): Partial<Record<KeyT, StatisticalNumberSummary>> | null {
  // @ts-expect-error
  let valuesMap: Record<KeyT, number[]> = {}
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value !== 'number') continue
      if (!(key in valuesMap)) valuesMap[key as KeyT] = []
      valuesMap[key as KeyT].push(value as number)
    }
  }

  // @ts-expect-error
  let results: Record<KeyT, StatisticalNumberSummary> = {}

  for (const [key, values] of Object.entries(valuesMap)) {
    results[key as KeyT] = calculateStatisticalNumberSummary(values as number[])
  }

  return results
}

export function calculateStatisticalNumberSummary(values: number[]): StatisticalNumberSummary {
  if (values.length === 0) return { min: Infinity, max: -Infinity, sum: 0, avg: NaN }

  const _sum = sum(values)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    sum: _sum,
    avg: _sum / values.length,
  }
}

export function sum(numbers: (number | undefined)[]): number {
  return numbers
    .filter((num): num is number => num !== undefined)
    .reduce((accumulator, current) => accumulator + current, 0)
}
