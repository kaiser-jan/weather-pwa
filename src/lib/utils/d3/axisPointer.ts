import * as d3 from 'd3'
import type { Dimensions } from './types'
import { DateTime } from 'luxon'
import type { CreatedSeriesDetails } from '$lib/types/ui'
import { mount } from 'svelte'
import { autoFormatMetric } from '$lib/utils/units'
import { get } from 'svelte/store'
import { settings } from '$lib/settings/store'
import type { TimeSeriesNumberEntry, ForecastParameter } from '$lib/types/data'
import type { Icon } from '@lucide/svelte'

export function createAxisPointer(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  seriesList: CreatedSeriesDetails[]
  tooltip?: boolean
}) {
  const { svg, dimensions, scaleX, seriesList } = options

  function hideXAxisPointer() {
    xAxisPointer.classed('hidden', true)
    tooltip?.hideTooltip()
  }

  function updateXAxisPointer(timestamp: number, showTooltip = true) {
    xAxisPointer.classed('hidden', false)

    const points = seriesList.map((m) => getNearestPointAtTimestamp(timestamp, m, scaleX)).filter((p) => p !== null)

    const nearest = points.reduce((a, b) =>
      Math.abs(b.d.timestamp - timestamp) < Math.abs(a.d.timestamp - timestamp) ? b : a,
    )
    const highest = points.reduce((a, b) => (b.y < a.y ? b : a))
    xAxisPointer.attr('transform', `translate(${nearest.x},0)`)
    xAxisPointer.select('line').attr('y1', highest.y)

    points.forEach((p, i) =>
      xAxisPointer
        .select(`circle#x-axis-pointer-circle-${p.name}`)
        .attr('cy', p.y)
        .classed('!fill-text', i === 0 || !tooltip || !showTooltip),
    )

    if (tooltip) {
      tooltip.updateTooltip(nearest.x, points[0].y, points)
      if (!showTooltip) tooltip.hideTooltip()
    }

    return points
  }

  const xAxisPointer = svg.append('g')

  xAxisPointer
    .append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 123)
    .attr('y2', dimensions.height + dimensions.margin.top + 5)
    .classed('stroke-text-disabled stroke-2', true)

  for (const series of seriesList) {
    xAxisPointer
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 123)
      .attr('r', 4)
      .classed('stroke-midground fill-text-muted stroke-4', true)
      .attr('id', 'x-axis-pointer-circle-' + series.name)
    // only adding to the first item for now
    break
  }

  const tooltip = options.tooltip ? createTooltip({ svg, dimensions }) : null

  updateXAxisPointer(DateTime.now().toMillis(), false)

  return {
    updateXAxisPointer,
    hideXAxisPointer,
  }
}

const bisect = d3.bisector<TimeSeriesNumberEntry, number>((d) => d.timestamp).left
function getNearestPointAtTimestamp(
  timestamp: number,
  series: CreatedSeriesDetails,
  scaleX: d3.ScaleTime<number, number, never>,
) {
  const x0 = timestamp
  const i = bisect(series.data, x0) ?? series.data.length - 1
  const d0 = series.data[i - 1]
  const d1 = series.data[i]
  const d = d0 === undefined || Math.abs(d0.timestamp - x0) > Math.abs(d1?.timestamp - x0) ? d1 : d0

  if (!d) return null

  return {
    x: scaleX(d.timestamp),
    y: series.scale(d.value),
    d,
    name: series.name,
    icon: series.icon,
    abbreviation: series.abbreviation,
  }
}

// PERF: rendering the icons has a noticable performance impact
const renderedIcons: Record<string, string> = {}
function renderIcon(id: string, icon: typeof Icon, size = 16): string {
  if (renderedIcons[id]) return renderedIcons[id]

  const container = document.createElement('div')
  mount(icon, { target: container, props: { size } })
  const renderedIcon = container.innerHTML

  renderedIcons[id] = renderedIcon
  return renderedIcon
}

export function createTooltip(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
}) {
  const { svg, dimensions } = options

  const fo = svg //
    .append('foreignObject')
    .attr('width', 200)
    .attr('height', 200)
    .style('pointer-events', 'none')
    .attr('data-vaul-no-drag', '')

  const tooltip = fo
    .append('xhtml:div')
    .attr('class', 'text-xs bg-foreground text-text backdrop-blur rounded px-2 py-1 shadow w-fit min-w-20')
    .style('opacity', 0)

  function hideTooltip() {
    tooltip.style('opacity', 0)
  }

  function updateTooltip(x: number, y: number, points: NonNullable<ReturnType<typeof getNearestPointAtTimestamp>>[]) {
    const alignLeft = x > dimensions.widthFull / 2
    const alignTop = y > dimensions.heightFull / 2
    const offset = 4
    const tooltipBBox = (tooltip.node() as Element).getBoundingClientRect()

    fo.attr('x', x + (alignLeft ? -tooltipBBox.width - 3 - offset : offset)).attr(
      'y',
      y + (alignTop ? -tooltipBBox.height - 3 - offset : offset),
    )

    if (points.length === 0) {
      hideTooltip()
      return
    }

    tooltip.html(
      `<b>${DateTime.fromMillis(points[0].d.timestamp).toFormat('HH:mm')}</b><br>${points
        .map((p) => {
          const svg = p.icon ? renderIcon(p.name, p.icon) : (p.abbreviation ?? p.name)
          const metric = autoFormatMetric(p.d.value, p.name as ForecastParameter, get(settings), { showDecimal: true })
          return `<div class="flex items-center gap-2">${svg} <span class='ml-auto'>${metric}</span></div>`
        })
        .join('')}`,
    )
    tooltip.style('opacity', 1)
  }

  return { hideTooltip, updateTooltip }
}
