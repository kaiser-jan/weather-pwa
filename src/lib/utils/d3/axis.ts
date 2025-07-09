import * as d3 from 'd3'
import type { Dimensions } from './types'
import { settings } from '$lib/settings/store'
import { get } from 'svelte/store'

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

export function createYAxis(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scale: d3.AxisScale<number>
  side: 'right' | 'left'
  format: (d: number) => string
  unit: string
  addLines?: boolean
}) {
  const { svg, dimensions, scale, format } = options

  const axisGenerator = options.side === 'left' ? d3.axisLeft : d3.axisRight

  const tickFormat = get(settings).chart.axisUnits === 'inline' ? format : d3.format('.1~f')

  const yAxis = svg
    .append('g')
    .call(
      axisGenerator(scale)
        .tickFormat(tickFormat)
        .tickSizeOuter(get(settings).chart.axisUnits === 'replace' ? 0 : 6),
    )
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

  if (get(settings).chart.axisUnits === 'above') {
    yAxis
      .append('text')
      .attr('x', 0)
      .attr('y', 10)
      .attr('text-anchor', options.side === 'left' ? 'right' : 'left')
      .attr('class', 'text-2xs fill-text-muted')
      .text(options.unit)
  }

  if (get(settings).chart.axisUnits === 'replace') {
    yAxis
      .selectAll('.tick')
      .filter((_, i, nodes) => i === nodes.length - 1)
      .select('line')
      .remove()

    yAxis
      .selectAll('.tick')
      .filter((_, i, nodes) => i === nodes.length - 1)
      .select('text')
      .attr('class', 'text-2xs fill-text-muted')
      .text(options.unit)
  }

  return yAxis
}
