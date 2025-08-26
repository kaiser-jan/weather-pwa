import type { ForecastMetric } from '$lib/config/metrics'
import type { ForecastParameter, MultivariateTimeSeries, TimeSeries } from '$lib/types/data'

function calculateDewPoint({ temperature, relative_humidity }: { temperature: number; relative_humidity: number }) {
  const b = 17.625
  const c = 243.04
  const gamma = Math.log(relative_humidity / 100) + (b * temperature) / (c + temperature)
  return (c * gamma) / (b - gamma)
}

const derivedMetrics = [
  { metric: 'dew_point', sourceMetrics: ['temperature', 'relative_humidity'], callback: calculateDewPoint },
] as const satisfies {
  metric: ForecastParameter
  sourceMetrics: ForecastParameter[]
  callback: (values: Record<ForecastParameter, number>) => number
}[]

export function addDerivedMetrics(multiseries: MultivariateTimeSeries) {
  for (const derivedMetric of derivedMetrics) {
    const result = deriveTimeseriesFromMetrics(multiseries, derivedMetric.sourceMetrics, derivedMetric.callback)
    if (!result) continue
    multiseries[derivedMetric.metric] = result
  }
}

function deriveTimeseriesFromMetrics<MetricT extends ForecastParameter>(
  multiseries: MultivariateTimeSeries,
  metrics: MetricT[],
  callback: (values: Record<MetricT, number>) => number,
) {
  if (metrics.some((m) => !multiseries[m])) return null

  const timeseriesList = metrics.map((m) => multiseries[m as ForecastParameter]) as TimeSeries<number>[]
  const timstamps = timeseriesList.flatMap((s) => s.map((d) => d.timestamp)).sort()
  console.log(timstamps)

  const derivedTimeseries: TimeSeries<number> = []
  for (const timestamp of timstamps) {
    const timebucketMap: Partial<Record<MetricT, TimeSeries<number>[number]>> = {}

    for (const metric of metrics) {
      const metricTimeseries = multiseries[metric as ForecastParameter]!
      const nextBucketIndex = metricTimeseries?.findIndex((d) => d.timestamp > timestamp)
      // exit if there is no matching timebucket
      if (nextBucketIndex === undefined || nextBucketIndex === -1) continue
      const currentBucket = metricTimeseries[nextBucketIndex - 1]
      // exit if the timebucket ends to early
      if (currentBucket.timestamp + currentBucket.duration < timestamp) continue
      timebucketMap[metric] = currentBucket
    }

    const timebucketList = Object.values(timebucketMap) as TimeSeries<number>[number][]

    if (timebucketList.length < metrics.length) continue

    const endTimestamps = timebucketList.map((v) => v.timestamp + v.duration).sort()
    const earliestEndTimestamp = endTimestamps[0]

    derivedTimeseries.push({
      timestamp,
      duration: earliestEndTimestamp - timestamp,
      value: callback(Object.fromEntries(metrics.map((m) => [m, timebucketMap[m]?.value!])) as Record<MetricT, number>),
    })
  }

  return derivedTimeseries
}
