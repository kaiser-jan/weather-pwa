import * as d3 from 'd3'
import type { Dimensions } from './types'

export function createXAxis<ScaleT extends d3.AxisDomain>(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scale: d3.AxisScale<ScaleT>
  addLines?: boolean
}) {
  const { svg, dimensions, scale } = options
  // Add the x-axis.
  const xAxis = svg
    .append('g')
    .call(
      d3
        .axisBottom(scale)
        .ticks(d3.timeHour.every(6))
        .tickSizeInner(16)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat('%H') as any),
    )
    .classed('text-overlay', true)
    .call((g) =>
      g
        .selectAll('.tick text')
        .classed('text-text-muted', true)
        .attr('text-anchor', 'start')
        .attr('dx', 4)
        .attr('dy', -4),
    )

  if (options.addLines) {
    xAxis.call((g) =>
      g
        .selectAll('.tick line')
        .filter((_, i, __) => i !== 0) // exclude last tick
        .clone()
        .attr('y1', 0)
        .classed('stroke-overlay', true)
        .attr('y2', -dimensions.height),
    )
  }

  return xAxis
}

export function createYAxis<ScaleT extends d3.AxisDomain>(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scale: d3.AxisScale<ScaleT>
  side: 'right' | 'left'
  format: (domainValue: ScaleT, index: number) => string
  addLines?: boolean
}) {
  const { svg, dimensions, scale, format } = options

  const axisGenerator = options.side === 'left' ? d3.axisLeft : d3.axisRight

  const yAxis = svg
    .append('g')
    .call(axisGenerator(scale).tickFormat(format))
    .classed('text-overlay', true)
    .call((g) => g.selectAll('.tick text').classed('text-text-muted', true))

  if (options.addLines) {
    yAxis.call((g) =>
      g
        .selectAll('.tick line')
        .filter((_, i, __) => i !== 0) // exclude last tick
        .clone()
        .attr('x2', dimensions.width)
        .classed('stroke-overlay', true),
    )
  }

  return yAxis
}
