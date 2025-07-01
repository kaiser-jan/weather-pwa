import * as d3 from 'd3'
import type { TimeSeries, TimeSeriesNumberEntry } from '$lib/types/data'
import type { Dimensions } from './types'
import { DateTime } from 'luxon'

interface SeriesDetails {
  name: string
  scale: d3.ScaleLinear<number, number, never>
  data: TimeSeries<number>
  formatter: (d: number) => string
}

export function createAxisPointer(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  seriesList: SeriesDetails[]
}) {
  const { svg, dimensions, scaleX, seriesList } = options

  function getNearestPointAtDateTime(datetime: DateTime, series: SeriesDetails) {
    const x0 = datetime.toMillis()
    const i = bisect(series.data, x0)
    const d0 = series.data[i - 1]
    const d1 = series.data[i]
    const d = !d0 || x0 - d0.datetime.toMillis() > d1.datetime.toMillis() - x0 ? d1 : d0

    return {
      x: scaleX(d.datetime.toMillis()),
      y: series.scale(d.value),
      d,
      name: series.name,
      formatter: series.formatter,
    }
  }

  function updateXAxisPointer(datetime: DateTime, showTooltip = true) {
    const points = seriesList.map((m) => getNearestPointAtDateTime(datetime, m)).filter((p) => p !== null)

    const nearest = points.reduce((a, b) => (b.d.datetime.diffNow() < a.d.datetime.diffNow() ? b : a))
    const highest = points.reduce((a, b) => (b.y < a.y ? b : a))
    xAxisPointer.attr('transform', `translate(${nearest.x},0)`)
    xAxisPointer.select('line').attr('y1', highest.y)

    points.forEach((p) => xAxisPointer.select(`circle#x-axis-pointer-circle-${p.name}`).attr('cy', p.y))

    if (!showTooltip) {
      fo.style('display', 'none')
      return
    }

    fo.attr('x', nearest.x + 8)
      .attr('y', points[0].y - 20)
      .style('display', null)
    tooltip.html(
      `${points[0].d.datetime.toFormat('HH:mm')}<br>${points.map((p) => p.formatter(p.d.value)).join('<br>')}`,
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
      .classed('stroke-midground fill-text stroke-4', true)
      .attr('id', 'x-axis-pointer-circle-' + series.name)
  }

  const bisect = d3.bisector<TimeSeriesNumberEntry, number>((d) => d.datetime.toMillis()).left

  const fo = svg
    .append('foreignObject')
    .attr('width', 100)
    .attr('height', 100)
    .style('pointer-events', 'none')
    .style('display', 'none')

  const tooltip = fo
    .append('xhtml:div')
    .attr('class', 'text-xs bg-foreground text-text backdrop-blur rounded px-2 py-1 shadow w-fit')

  let dragMode: 'x' | 'scroll' | null = null
  let startX: number | null = null
  let startY: number | null = null
  let pointerDownTimeout: number | undefined = undefined

  svg.on('pointerdown', (event: PointerEvent) => {
    dragMode = null
    startX = event.clientX
    startY = event.clientY

    pointerDownTimeout = setTimeout(() => {
      if (!startX) return

      dragMode = 'x'

      const datetime = DateTime.fromMillis(scaleX.invert(startX).getTime())
      updateXAxisPointer(datetime)
    }, 100)
  })

  svg.on('touchmove', (event) => {
    if (dragMode === 'x') event.preventDefault()
  })

  svg.on('pointermove', (event: PointerEvent) => {
    clearTimeout(pointerDownTimeout)

    // HACK: allow hover interaction, no pointerdown has occurred
    if (startX === null || startY === null) {
      dragMode = 'x'
    } else if (!dragMode) {
      const dx = Math.abs(event.clientX - startX)
      const dy = Math.abs(event.clientY - startY)
      dragMode = dx > dy ? 'x' : 'scroll'
    }

    if (dragMode === 'x') {
      event.preventDefault()

      const [px] = d3.pointer(event)
      const datetime = DateTime.fromMillis(scaleX.invert(px).getTime())
      updateXAxisPointer(datetime)
    }
  })

  svg.on('pointerleave', () => {
    updateXAxisPointer(DateTime.now(), false)
    dragMode = null
    startX = null
    startY = null
    clearTimeout(pointerDownTimeout)
  })

  updateXAxisPointer(DateTime.now())
}
