import * as d3 from 'd3'
import type { Dimensions } from './types'
import { settings } from '$lib/settings/store'
import { get } from 'svelte/store'
import type { Unit } from '$lib/config/units'

export function createXAxis(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scale: d3.AxisScale<number>
  addLines?: boolean
}) {
  const { svg, dimensions, scale } = options

  const [start, end] = scale.domain()
  const hours = (end - start) / 36e5

  let ticks: { interval: d3.TimeInterval | null; format: string }
  if (hours < 12) ticks = { interval: d3.timeHour.every(1), format: '%H' }
  else if (hours < 24) ticks = { interval: d3.timeHour.every(3), format: '%H' }
  else if (hours < 48) ticks = { interval: d3.timeHour.every(6), format: '%H' }
  else if (hours < 96) ticks = { interval: d3.timeHour.every(12), format: '%a' }
  else ticks = { interval: d3.timeHour.every(24), format: '%a' }

  const xAxis = svg
    .append('g')
    .call(
      d3
        .axisBottom(scale)
        .ticks(ticks.interval)
        .tickSizeInner(16)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat(ticks.format) as any),
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
  unit: Unit | null
  addLines?: boolean
}) {
  const { svg, dimensions, scale, format } = options

  const axisGenerator = options.side === 'left' ? d3.axisLeft : d3.axisRight

  const yAxis = svg
    .append('g')
    .call(
      axisGenerator(scale)
        .tickFormat(format)
        .tickSizeOuter(get(settings).sections.components.chart.axisUnits === 'replace' ? 0 : 6),
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

  if (get(settings).sections.components.chart.axisUnits === 'above') {
    yAxis
      .append('text')
      .attr('x', 0)
      .attr('y', 10)
      .attr('text-anchor', options.side === 'left' ? 'right' : 'left')
      .attr('class', 'text-2xs fill-text-muted')
      .text(options.unit)
  }

  if (get(settings).sections.components.chart.axisUnits === 'replace') {
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
