import type { MultivariateTimeSeries, TimeSeries } from '$lib/types/data'

export function mergeMultivariateTimeSeries(
  multiseriesA: MultivariateTimeSeries,
  multiseriesB: MultivariateTimeSeries,
) {
  const timeSeriesResult: MultivariateTimeSeries = {}

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

    timeSeriesResult[parameterTyped] = mergeTimeSeries(a, b)
  }

  return timeSeriesResult
}

export function mergeTimeSeries(timeseriesA: TimeSeries<number>, timeseriesB: TimeSeries<number>) {
  // collect all bounds (start- and end-timestamps)
  const bounds = new Set<number>()
  for (const { timestamp, duration } of [...timeseriesA!, ...timeseriesB]) {
    bounds.add(timestamp)
    bounds.add(timestamp + duration)
  }

  // sort the bounds
  const times = Array.from(bounds).sort((x, y) => x - y)

  const findCover = (series: TimeSeries<number>, start: number, end: number) =>
    series.find((pt) => pt.timestamp <= start && pt.timestamp + pt.duration >= end && pt.value !== null)

  const out: TimeSeries<number> = []
  for (let i = 0; i < times.length - 1; i++) {
    const start = times[i]
    const end = times[i + 1]
    const segDur = end - start
    const pa = findCover(timeseriesA, start, end)
    const pb = findCover(timeseriesB, start, end)
    let src: TimeSeries<number>[number] | undefined

    if (pa && pb) {
      src = pa.duration < pb.duration ? pa : pb
    } else {
      src = pa ?? pb
    }
    if (!src) continue
    out.push({ timestamp: start, duration: segDur, value: src.value })
  }

  return out
}
