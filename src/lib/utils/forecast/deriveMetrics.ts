import type { Coordinates, ForecastParameter, MultivariateTimeSeries, TimeSeries } from '$lib/types/data'
import { getEaqiLevel, getEaqiLevels, getTotalEaqiIndex } from './aqi/eaqi'
import { mergeTimeSeries } from './multiseries'

function calculateDewPoint({ temperature, relative_humidity }: { temperature: number; relative_humidity: number }) {
  const b = 17.625
  const c = 243.04
  const gamma = Math.log(relative_humidity / 100) + (b * temperature) / (c + temperature)
  return (c * gamma) / (b - gamma)
}

const g = 9.80665 // m/s²
const M = 0.0289644 // kg/mol
const R = 8.31432 // J/(mol·K)
const L = 0.0065 // K/m (lapse rate)

function convertSurfacePressureToSeaLevel(
  { temperature, pressure_surface }: { temperature: number; pressure_surface: number },
  coordinates: Coordinates,
): number {
  const T = temperature + 273.15

  const factor = (g * M) / (R * L)
  const base = 1 - (L * coordinates.altitude!) / T

  return pressure_surface * Math.pow(base, -factor)
}
function convertSealevelPressureToSurface(
  { temperature, pressure_sealevel }: { temperature: number; pressure_sealevel: number },
  coordinates: Coordinates,
): number {
  console.log(temperature, pressure_sealevel, coordinates.altitude)
  const T = temperature + 273.15

  const factor = (g * M) / (R * L)
  const base = 1 - (L * coordinates.altitude!) / T

  return pressure_sealevel * Math.pow(base, factor)
}

interface DerivedMetric {
  metric: ForecastParameter
  notAllSourcesRequired?: boolean
  sourceMetrics: ForecastParameter[]
  requiresAltitude?: boolean
  callback: (values: Record<ForecastParameter, number>, coordinates: Coordinates) => number | null
}

const derivedMetrics: DerivedMetric[] = [
  { metric: 'dew_point', sourceMetrics: ['temperature', 'relative_humidity'], callback: calculateDewPoint },
  {
    metric: 'pressure_surface',
    sourceMetrics: ['temperature', 'pressure_sealevel'],
    requiresAltitude: true,
    callback: convertSealevelPressureToSurface,
  },
  {
    metric: 'pressure_sealevel',
    sourceMetrics: ['temperature', 'pressure_surface'],
    requiresAltitude: true,
    callback: convertSurfacePressureToSeaLevel,
  },
  {
    metric: 'aqi',
    sourceMetrics: ['pm25', 'pm10', 'o3', 'no2'],
    notAllSourcesRequired: true,
    callback: (values) => getTotalEaqiIndex(getEaqiLevels(values)) ?? null,
  },
] as const

export function addDerivedMetrics(multiseries: MultivariateTimeSeries, coordinates: Coordinates) {
  for (const derivedMetric of derivedMetrics) {
    if (derivedMetric.requiresAltitude && coordinates.altitude === null) continue

    const result = deriveTimeseriesFromMetrics(
      multiseries,
      coordinates,
      derivedMetric.sourceMetrics,
      derivedMetric.callback,
    )
    if (!result) continue

    const existingTimeseries = multiseries[derivedMetric.metric]
    if (!existingTimeseries) {
      multiseries[derivedMetric.metric] = result
    } else {
      multiseries[derivedMetric.metric] = mergeTimeSeries(existingTimeseries, result)
    }
  }
}

function deriveTimeseriesFromMetrics<MetricT extends ForecastParameter>(
  multiseries: MultivariateTimeSeries,
  coordinates: Coordinates,
  metrics: MetricT[],
  callback: (values: Record<MetricT, number>, coordinates: Coordinates) => number | null,
) {
  if (metrics.some((m) => !multiseries[m])) return null

  const timeseriesList = metrics.map((m) => multiseries[m as ForecastParameter]) as TimeSeries<number>[]
  const timestamps = timeseriesList.flatMap((s) => s.map((d) => d.timestamp))
  const timestampsSorted = Array.from(new Set(timestamps)).sort()

  const derivedTimeseries: TimeSeries<number> = []
  for (const timestamp of timestampsSorted) {
    const timebucketMap: Partial<Record<MetricT, TimeSeries<number>[number]>> = {}

    for (const metric of metrics) {
      const metricTimeseries = multiseries[metric as ForecastParameter]!
      const nextBucketIndex = metricTimeseries?.findIndex((d) => d.timestamp > timestamp)
      // exit if there is no matching timebucket
      if (nextBucketIndex === undefined || nextBucketIndex === -1) continue
      const currentBucket = metricTimeseries[nextBucketIndex - 1]
      // exit if the timebucket ends to early
      if (!currentBucket || currentBucket.timestamp + currentBucket.duration < timestamp) continue
      timebucketMap[metric] = currentBucket
    }

    console.log(timebucketMap)
    const timebucketList = Object.values(timebucketMap) as TimeSeries<number>[number][]

    if (timebucketList.length < metrics.length) continue

    const endTimestamps = timebucketList.map((v) => v.timestamp + v.duration).sort()
    const earliestEndTimestamp = endTimestamps[0]

    const value = callback(
      Object.fromEntries(metrics.map((m) => [m, timebucketMap[m]?.value!])) as Record<MetricT, number>,
      coordinates,
    )

    if (value === null) continue

    derivedTimeseries.push({
      timestamp,
      duration: earliestEndTimestamp - timestamp,
      value,
    })
  }

  return derivedTimeseries
}
