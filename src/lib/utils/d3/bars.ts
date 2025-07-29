import * as d3 from 'd3'
import type { TimeSeriesNumberEntry } from '$lib/types/data'
import type { Dimensions } from './types'

export function createBars(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  scaleY: d3.ScaleLinear<number, number, never>
  data: TimeSeriesNumberEntry[]
}) {
  const { svg, dimensions, scaleX, scaleY, data } = options
  const padding = 2
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
      return Math.max(width, 2)
    })
    .attr('y', (d) => scaleY(d.value))
    .attr('height', (d) => dimensions.height + dimensions.margin.top - scaleY(d.value))

  return bars
}
