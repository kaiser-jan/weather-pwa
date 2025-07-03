import * as d3 from 'd3'
import type { TimeSeries, TimeSeriesNumberEntry } from '$lib/types/data'
import type { Dimensions } from './types'
import { DateTime } from 'luxon'
import type { CreatedSeriesDetails } from '$lib/types/ui'
import { mount } from 'svelte'

export function createAxisPointer(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  seriesList: CreatedSeriesDetails[]
}) {
  const { svg, dimensions, scaleX, seriesList } = options

  function getNearestPointAtDateTime(datetime: DateTime, series: CreatedSeriesDetails) {
    const x0 = datetime.toMillis()
    const i = bisect(series.data, x0)
    const d0 = series.data[i - 1]
    const d1 = series.data[i]
    const d = !d0 || x0 - d0.datetime.toMillis() > d1?.datetime?.toMillis() - x0 ? d1 : d0

    return {
      x: scaleX(d.datetime.toMillis()),
      y: series.scale(d.value),
      d,
      name: series.name,
      formatter: series.formatter,
      icon: series.icon,
    }
  }

  function updateXAxisPointer(datetime: DateTime, showTooltip = true) {
    const points = seriesList.map((m) => getNearestPointAtDateTime(datetime, m)).filter((p) => p !== null)

    const nearest = points.reduce((a, b) => (b.d.datetime.diffNow() < a.d.datetime.diffNow() ? b : a))
    const highest = points.reduce((a, b) => (b.y < a.y ? b : a))
    xAxisPointer.attr('transform', `translate(${nearest.x},0)`)
    xAxisPointer.select('line').attr('y1', highest.y)

    points.forEach((p, i) =>
      xAxisPointer
        .select(`circle#x-axis-pointer-circle-${p.name}`)
        .attr('cy', p.y)
        .classed('!fill-text', i === 0),
    )

    if (!showTooltip) {
      fo.style('display', 'none')
      return
    }

    const alignLeft = nearest.x > dimensions.widthFull / 2
    const alignTop = points[0].y > dimensions.heightFull / 2
    const offset = 4
    const tooltipBBox = (tooltip.node() as Element).getBoundingClientRect()

    fo.attr('x', nearest.x + (alignLeft ? -tooltipBBox.width - 3 - offset : offset))
      .attr('y', points[0].y + (alignTop ? -tooltipBBox.height - 3 - offset : offset))
      .style('display', null)

    tooltip.html(
      `${points[0].d.datetime.toFormat('HH:mm')}<br>${points
        .map((p) => {
          const svg = renderIcon(p.name, p.icon)
          const text = p.formatter(p.d.value)
          return `<div class="flex items-center gap-2">${svg}${text}</div>`
        })
        .join('')}`,
    )
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
  }

  const bisect = d3.bisector<TimeSeriesNumberEntry, number>((d) => d.datetime.toMillis()).left

  const fo = svg
    .append('foreignObject')
    .attr('width', 200)
    .attr('height', 200)
    .style('pointer-events', 'none')
    .style('display', 'none')

  const tooltip = fo
    .append('xhtml:div')
    .attr('class', 'text-xs bg-foreground text-text backdrop-blur rounded px-2 py-1 shadow w-fit min-w-20')

  let pointerMode: 'x' | 'y' | 'swipe-x' | null = null
  let startX: number | null = null
  let startY: number | null = null
  let pointerDownTimeout: number | undefined = undefined

  svg.on('pointerdown', (event: PointerEvent) => {
    pointerMode = null
    startX = event.clientX
    startY = event.clientY

    pointerDownTimeout = setTimeout(() => {
      if (!startX) return

      pointerMode = 'x'

      const datetime = DateTime.fromMillis(scaleX.invert(startX).getTime())
      updateXAxisPointer(datetime)
    }, 100)
  })

  svg.on('touchmove', (event) => {
    if (pointerMode === 'x') event.preventDefault()
  })

  svg.on('pointermove', (event: PointerEvent) => {
    clearTimeout(pointerDownTimeout)

    // HACK: allow hover interaction, no pointerdown has occurred
    if (startX === null || startY === null) {
      pointerMode = 'x'
    } else if (!pointerMode) {
      const dx = Math.abs(event.clientX - startX)
      const dy = Math.abs(event.clientY - startY)
      pointerMode = dx > dy ? 'x' : 'y'

      if (dx > 3) {
        pointerMode = 'swipe-x'
      }
    }

    if (pointerMode === 'x') {
      event.preventDefault()

      const [px] = d3.pointer(event)
      const datetime = DateTime.fromMillis(scaleX.invert(px).getTime())
      updateXAxisPointer(datetime)
    }
  })

  svg.on('pointerleave', () => {
    updateXAxisPointer(DateTime.now(), false)
    pointerMode = null
    startX = null
    startY = null
    clearTimeout(pointerDownTimeout)
  })

  updateXAxisPointer(DateTime.now(), false)
}

// PERF: rendering the icons has a noticable performance impact
let renderedIcons: Record<string, string> = {}
function renderIcon(id: string, icon: any, size = 16): string {
  if (renderedIcons[id]) return renderedIcons[id]

  const container = document.createElement('div')
  mount(icon, { target: container, props: { size } })
  const renderedIcon = container.innerHTML

  renderedIcons[id] = renderedIcon
  return renderedIcon
}
