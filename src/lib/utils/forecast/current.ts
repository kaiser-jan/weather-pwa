import type { Forecast, MultivariateTimeSeries } from '$lib/types/data'

export function currentFromMultiseries(multiseries: MultivariateTimeSeries, timestamp: number) {
  // retrieves the last value before timestamp for each series
  const current: Forecast['current'] = {}
  Object.entries(multiseries).forEach(([key, series]) => {
    current[key as keyof typeof current] = series.findLast((tp) => tp.timestamp < timestamp)?.value
  })
  return current
}
