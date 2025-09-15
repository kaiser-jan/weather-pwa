import * as d3 from 'd3'
import type { TimeSeriesNumberEntry } from '$lib/types/data'
import type { Dimensions } from './types'

export function createLine(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  scaleY: d3.ScaleLinear<number, number, never>
  data: TimeSeriesNumberEntry[]
}) {
  const { svg, dimensions, scaleX, scaleY, data } = options

  const lineGenerator = d3
    .line<TimeSeriesNumberEntry>()
    .x((d) => scaleX(d.timestamp))
    .y((d) => scaleY(d.value))
    .curve(d3.curveMonotoneX) // or: curveNatural (may overshoot), curveCatmullRom (tunable)
    .defined((d) => d.value !== null && !isNaN(d.value))

  const line = svg
    .append('path')
    .attr('stroke-width', 4)
    .attr('stroke-linecap', 'round')
    .attr('d', lineGenerator(data))
    .attr('fill', 'none')

  return line
}
