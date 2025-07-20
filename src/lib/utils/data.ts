import type { MultivariateTimeSeries, TimeSeries } from '$lib/types/data'
import { DateTime, type Duration } from 'luxon'

export type TimeSeriesConfig<InKeyT extends string, OutKeyT extends string> =
  | { type: 'normal'; inKey: InKeyT; outKey: OutKeyT; multiplier?: number }
  // accumulated value since start of the forecast until the timestamp -> the value of a TimePeriod depends on the following one
  | { type: 'accumulated-until'; inKey: InKeyT; outKey: OutKeyT }
  | { type: 'vector'; xKey: InKeyT; yKey: InKeyT; outKeyLength: OutKeyT; outKeyAngle: OutKeyT }

interface TimeValue {
  datetime: DateTime
  duration: Duration
  value: number | null
}

export function transformTimeSeries<ConfigInKeyT extends string, ConfigOutKeyT extends string>(
  timestamps: DateTime[],
  values: Record<string, { data: (number | null)[] }>,
  configs: TimeSeriesConfig<ConfigInKeyT, ConfigOutKeyT>[],
  duration: Duration,
): Record<string, TimeValue[]> {
  const output: Record<string, TimeValue[]> = {}

  // prepare output keys
  for (const cfg of configs) {
    if (cfg.type === 'vector') {
      output[cfg.outKeyLength] = []
      output[cfg.outKeyAngle] = []
    } else {
      output[cfg.outKey] = []
    }
  }

  // fill data
  timestamps.forEach((datetime, i) => {
    for (const item of configs) {
      if (item.type === 'normal') {
        const multiplier = item.multiplier ?? 1
        const rawValue = values[item.inKey].data[i]
        const value = rawValue !== null ? rawValue * multiplier : null
        output[item.outKey].push({ datetime, duration, value })
      }
      if (item.type === 'accumulated-until') {
        const arr = values[item.inKey].data
        const val = Math.max(0, (arr[i + 1] ?? 0) - (arr[i] ?? 0))
        output[item.outKey].push({ datetime, duration, value: val })
      }
      if (item.type === 'vector') {
        const vx = values[item.xKey].data[i]
        const vy = values[item.yKey].data[i]

        const isComplete = vx !== null || vy !== null

        const length = isComplete ? Math.hypot(vx!, vy!) : null
        const angle = isComplete ? (Math.atan2(vy!, vx!) * 180) / Math.PI : null
        output[item.outKeyLength].push({ datetime, duration, value: length })
        output[item.outKeyAngle].push({ datetime, duration, value: angle })
      }
    }
  })

  return output
}

export function mergeMultivariateTimeSeries(
  multiseriesA: MultivariateTimeSeries,
  multiseriesB: MultivariateTimeSeries,
) {
  let timeSeriesResult: MultivariateTimeSeries = {}

  const keys = Array.from(new Set([...Object.keys(multiseriesA), ...Object.keys(multiseriesB)]))

  for (const parameter of keys) {
    const parameterTyped = parameter as keyof typeof multiseriesB
    const a = multiseriesA[parameterTyped]!
    const b = multiseriesB[parameterTyped]!

    if (!a) {
      timeSeriesResult[parameterTyped] = b
      continue
    }
    if (!b) {
      timeSeriesResult[parameterTyped] = a
      continue
    }

    // collect all bounds (start- and end-timestamps)
    const bounds = new Set<number>()
    for (const { datetime, duration } of [...a!, ...b]) {
      bounds.add(datetime.toMillis())
      bounds.add(datetime.toMillis() + duration.toMillis())
    }

    // sort the bounds and convert back to DateTimes
    const times = Array.from(bounds)
      .sort((x, y) => x - y)
      .map((ms) => DateTime.fromMillis(ms))

    const findCover = (series: TimeSeries<number>, start: DateTime, end: DateTime) =>
      series.find(
        (pt) =>
          pt.datetime <= start &&
          pt.datetime.toMillis() + pt.duration.toMillis() >= end.toMillis() &&
          pt.value !== null,
      )

    const out: TimeSeries<number> = []
    for (let i = 0; i < times.length - 1; i++) {
      const start = times[i]
      const end = times[i + 1]
      const segDur = end.diff(start)
      const pa = findCover(a, start, end)
      const pb = findCover(b, start, end)
      let src: TimeSeries<number>[number] | undefined

      if (pa && pb) {
        src = pa.duration < pb.duration ? pa : pb
      } else {
        src = pa ?? pb
      }
      if (!src) continue
      out.push({ datetime: start, duration: segDur, value: src.value })
    }

    timeSeriesResult[parameterTyped] = out
  }

  return timeSeriesResult
}
