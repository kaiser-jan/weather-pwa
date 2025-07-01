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
      return scaleX(d.datetime)

      // const center = d.datetime.toMillis()
      // const half = d.duration.toMillis() / 2
      // return scaleX(center - half) + padding
    })
    .attr('width', (d) => {
      const start = d.datetime.toMillis()
      const end = start + d.duration.toMillis()
      const width = scaleX(end) - scaleX(start) - 2 * padding
      return Math.max(width, 1)
    })
    .attr('y', (d) => scaleY(d.value))
    .attr('height', (d) => dimensions.height + dimensions.margin.top - scaleY(d.value))
    .attr('clip-path', 'url(#clip)')

  return bars
}
