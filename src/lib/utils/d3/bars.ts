import * as d3 from 'd3'
import type {
  ForecastParameter,
  MultivariateTimeSeries,
  TimePeriod,
  TimeSeries,
  TimeSeriesNumberEntry,
} from '$lib/types/data'
import type { Dimensions } from './types'
import { mapValues, pick } from '$lib/utils'

function stackFromMultiseries(multiseries: MultivariateTimeSeries, parameters: string[]) {
  // collect all bounds (start- and end-timestamps)
  const bounds = new Set<number>()

  const parametersTyped = parameters as (keyof typeof multiseries)[]

  const combinedSeries = parametersTyped.map((p) => multiseries[p]).filter((s) => s !== undefined)

  for (const { timestamp, duration } of combinedSeries.flat()) {
    bounds.add(timestamp)
    bounds.add(timestamp + duration)
  }

  // sort the bounds
  const times = Array.from(bounds).sort((x, y) => x - y)

  /** Finds all items which overlap with the given timeframe. */
  function findCover(series: TimeSeries<number>, start: number, end: number) {
    return series.find((pt) => pt.timestamp <= start && pt.timestamp + pt.duration >= end && pt.value !== null)
  }

  const out: TimeSeries<Partial<Record<ForecastParameter, number>>> = []
  for (let i = 0; i < times.length - 1; i++) {
    const start = times[i]
    const end = times[i + 1]
    const duration = end - start
    const coverData = mapValues(pick(multiseries, parametersTyped), (s) => findCover(s, start, end)?.value)

    out.push({ timestamp: start, duration: duration, value: coverData })
  }

  return out
}

export function createBars(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  scaleY: d3.ScaleLinear<number, number, never>
  data: TimeSeriesNumberEntry[]
  padding?: number
}) {
  const { svg, dimensions, scaleX, scaleY, data, padding = 0 } = options
  const bars = svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => {
      return scaleX(d.timestamp)

      // const center = d.timestamp
      // const half = d.timestamp / 2
      // return scaleX(center - half) + padding
    })
    .attr('width', (d) => {
      const start = d.timestamp
      const end = start + d.duration
      const width = scaleX(end) - scaleX(start) - 2 * padding
      return Math.max(width, padding)
    })
    .attr('y', (d) => scaleY(d.value))
    .attr('height', (d) => dimensions.height + dimensions.margin.top - scaleY(d.value))

  return bars
}

export function createBarsStacked(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  scaleY: d3.ScaleLinear<number, number, never>
  data: MultivariateTimeSeries
  keys: string[]
  padding?: number
  fillCallback?: (series: d3.Series<StackedDatum, string>, point: d3.SeriesPoint<StackedDatum>) => string
}) {
  const { svg, dimensions, scaleX, scaleY, data, keys, fillCallback, padding = 0 } = options

  console.log(data)

  // we first need to convert it into a different format -> buckets with every value for them
  const stack = d3
    .stack<StackedDatum>()
    .keys(keys)
    .value((d, k) => d.value[k])

  console.log(stack(stackFromMultiseries(data, keys)))

  const bars = svg
    .append('g')
    .selectAll('g.stack')
    .data(stack(stackFromMultiseries(data, keys)))
    .join('g')
    .each(function (e) {
      d3.select(this)
        .selectAll('rect')
        .data((d) => d as d3.Series<StackedDatum, string>)
        .join('rect')
        .attr('x', (d) => scaleX(d.data.timestamp))
        .attr('width', (d) => {
          const start = d.data.timestamp
          const end = start + d.data.duration
          const width = scaleX(end) - scaleX(start) - 2 * padding
          return Math.max(width, padding)
        })
        .attr('y', (d) => scaleY(d[1]))
        .attr('height', (d) => scaleY(d[0]) - scaleY(d[1]))
        .attr('fill', fillCallback ? (d) => fillCallback(e, d) : '')
    })

  return bars
}

export type StackedDatum = TimePeriod & {
  value: Record<string, number>
}
