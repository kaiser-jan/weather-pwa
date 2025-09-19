import type { Coordinates, ForecastParameter, MultivariateTimeSeries, TimeSeries } from '$lib/types/data'
import { getEaqiLevels, getTotalEaqiIndex } from './aqi/eaqi'
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

/**
 * Adds the declared derived metrics to the given multiseries, where available.
 */
export function addDerivedMetrics(multiseries: MultivariateTimeSeries, coordinates: Coordinates) {
  for (const derivedMetric of derivedMetrics) {
    if (derivedMetric.requiresAltitude && coordinates.altitude === null) continue

    // create a new derived timeseries
    const result = deriveTimeseriesFromMetrics(
      multiseries,
      coordinates,
      derivedMetric.sourceMetrics,
      derivedMetric.callback,
    )
    if (!result) continue

    // either merge the new into an existing timeseries, or just add the new one
    const existingTimeseries = multiseries[derivedMetric.metric]
    if (!existingTimeseries) {
      multiseries[derivedMetric.metric] = result
    } else {
      multiseries[derivedMetric.metric] = mergeTimeSeries(existingTimeseries, result)
    }
  }
}

/**
 * Creates a new timeseries by using the callback with the relevant metrics and adding the value with its timebucket.
 * @param metrics the metrics required for calculating the derived metric
 * @param callback the function which calculates the derived metric
 */
function deriveTimeseriesFromMetrics<MetricT extends ForecastParameter>(
  multiseries: MultivariateTimeSeries,
  coordinates: Coordinates,
  metrics: MetricT[],
  callback: (values: Record<MetricT, number>, coordinates: Coordinates) => number | null,
) {
  // all required metrics must exist
  if (metrics.some((m) => !multiseries[m])) return null

  // create a sorted list of all timestamps of any series
  const timeseriesList = metrics.map((m) => multiseries[m as ForecastParameter]) as TimeSeries<number>[]
  const timestamps = timeseriesList.flatMap((s) => s.map((d) => d.timestamp))
  const timestampsSorted = Array.from(new Set(timestamps)).sort()

  // iterate over the timestamps and create the derived timebuckets for them
  const derivedTimeseries: TimeSeries<number> = []
  for (const timestamp of timestampsSorted) {
    const timebucketMap: Partial<Record<MetricT, TimeSeries<number>[number]>> = {}

    // collect all required
    for (const metric of metrics) {
      const metricTimeseries = multiseries[metric as ForecastParameter]!
      // get the last timebucket with a matching start
      const currentBucket = metricTimeseries?.findLast((d) => d.timestamp <= timestamp)
      // exit if the timebucket ends to early
      if (!currentBucket || currentBucket.timestamp + currentBucket.duration < timestamp) continue
      // add the metrics timebucket
      timebucketMap[metric] = currentBucket
    }

    const timebucketList = Object.values(timebucketMap) as TimeSeries<number>[number][]

    // exit if not all metrics have a matching timebucket
    if (timebucketList.length < metrics.length) continue

    // find the earliest end timestamp
    const endTimestamps = timebucketList.map((v) => v.timestamp + v.duration).sort()
    const earliestEndTimestamp = endTimestamps[0]

    // calculate the value
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
