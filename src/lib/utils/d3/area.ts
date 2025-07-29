import * as d3 from 'd3'
import type { TimeSeriesNumberEntry } from '$lib/types/data'
import type { Dimensions } from './types'

export function createArea(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  scaleY: d3.ScaleLinear<number, number, never>
  dataA: TimeSeriesNumberEntry[]
  dataB: TimeSeriesNumberEntry[]
}) {
  const { svg, dimensions, scaleX, scaleY, dataA, dataB } = options

  const areaGenerator = d3
    .area<TimeSeriesNumberEntry>()
    .x((d) => scaleX(d.timestamp))
    .y0((d, i) => scaleY(dataA[i].value)) // NOTE: assumes the indices match
    // .y0((d, i) => scaleY(dataA.find((dA) => dA.datetime.equals(d.datetime))?.value))
    .y1((d) => scaleY(d.value))
    .curve(d3.curveBasis)

  const area = svg
    .append('path')
    .attr('stroke-width', 4)
    .attr('stroke-linecap', 'round')
    .attr('d', areaGenerator(dataB))

  return area
}
