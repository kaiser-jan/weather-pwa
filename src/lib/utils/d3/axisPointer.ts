import * as d3 from 'd3'
import type { Dimensions } from './types'
import { DateTime } from 'luxon'
import type { CreatedSeriesDetails } from '$lib/types/ui'
import { mount } from 'svelte'
import { autoFormatMetric } from '$lib/utils/units'
import { get } from 'svelte/store'
import { settings } from '$lib/stores/settings'
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

    if (!points.length) return

    const nearest = points.reduce((a, b) =>
      Math.abs(b.datum.timestamp - timestamp) < Math.abs(a.datum.timestamp - timestamp) ? b : a,
    )
    const highest = points.reduce((a, b) => (b.y < a.y ? b : a))
    xAxisPointer.attr('transform', `translate(${nearest.x},0)`)
    xAxisPointer.select('line').attr('y1', highest.y)

    points.forEach((p, i) =>
      xAxisPointer
        .select(`circle#x-axis-pointer-circle-${p.parameter}`)
        .attr('cy', p.y)
        .classed('fill-text!', i === 0 || !tooltip || !showTooltip),
    )

    if (tooltip) {
      tooltip.updateTooltip(nearest.x, points[0].y, nearest.datum.timestamp, points)
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
      .attr('id', 'x-axis-pointer-circle-' + series.parameter)
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
  // NOTE: using the previous point instead of using the next if its closer
  // this would cause the axis pointer to jump e.g. for hourly data around :30
  const datum = series.data[i - 1] ?? series.data[i]

  if (!series.data.length || !datum) return null

  // NOTE: checking if we are past the last is currently not required
  // if it was, we would also need to check if this is the end of the charted timeperiod, otherwise the last timestamp is not accessible
  const isNotDefined = x0 < series.data[0].timestamp // || x0 > series.data[series.data.length - 1].timestamp
  if (isNotDefined) return null

  return {
    x: scaleX(datum.timestamp),
    y: series.scale(datum.value),
    datum,
    parameter: series.parameter,
    details: series.details,
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

  function updateTooltip(
    x: number,
    y: number,
    timestamp: number,
    points: NonNullable<ReturnType<typeof getNearestPointAtTimestamp>>[],
  ) {
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
      `<b>${DateTime.fromMillis(timestamp).toFormat('HH:mm')}</b><br>${points
        .map((p) => {
          const svg = p.details.icon ? renderIcon(p.parameter, p.details.icon) : (p.details.abbreviation ?? p.parameter)
          const metric = autoFormatMetric(p.datum.value, p.parameter as ForecastParameter, get(settings), {
            showDecimal: true,
          })
          return `<div class="flex items-center gap-2">${svg} <span class='ml-auto'>${metric}</span></div>`
        })
        .join('')}`,
    )
    tooltip.style('opacity', 1)
  }

  return { hideTooltip, updateTooltip }
}
