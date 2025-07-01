<script lang="ts">
  import type { Forecast, TimePeriod, TimeSeries, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { onMount } from 'svelte'
  import { Button } from '../ui/button'
  import { RotateCwIcon } from 'lucide-svelte'
  import * as d3 from 'd3'
  import { DateTime } from 'luxon'
  import { CONFIG } from '$lib/config'
  import { interpolateColor } from '$lib/utils/ui'

  interface Props {
    data: Partial<Forecast>
  }

  const { data }: Props = $props()

  let container: HTMLDivElement
  let visibleSeries: string[] = ['temperature'] // names of series to display

  function updateChart() {
    if (!data.multiseries?.temperature || !data.multiseries.precipitation_amount) return

    const margin = { top: 10, right: 0, bottom: 10, left: 30 }
    // const width = container.clientWidth - margin.left - margin.right
    const width = 360 - margin.left - margin.right
    const height = 240 - margin.top - margin.bottom

    // 2. Create the SVG for the chart
    //    Use the width and height in setting the viewBox
    const svg = d3
      .select(container)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width + margin.right + margin.left} ${height + margin.top + margin.bottom}`)

    // Declare the x (horizontal position) scale.
    // const minTime = d3.min(data.multiseries.temperature, (d) => d.datetime.toMillis())!
    const x = d3.scaleUtc(
      [
        DateTime.now().plus({ days: 0 }).startOf('day').toMillis(),
        DateTime.now().plus({ days: 0 }).endOf('day').toMillis(),
      ],
      [margin.left, width - margin.right],
    )

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear(
      [0, d3.max(data.multiseries.temperature, (d) => d.value)!],
      [height - margin.bottom, margin.top],
    )
    const y2 = d3.scaleLinear(
      [0, d3.max(data.multiseries.precipitation_amount, (d) => d.value)!],
      [height - margin.bottom, margin.top],
    )

    // Declare the line generator.
    const line = d3
      .line<TimeSeriesNumberEntry>()
      .x((d) => x(d.datetime.toMillis()))
      .y((d) => y(d.value))
      .curve(d3.curveBasis)

    const line2 = d3
      .line<TimeSeriesNumberEntry>()
      .x((d) => x(d.datetime.toMillis()))
      .y((d) => y2(d.value))
      .curve(d3.curveBasis)

    // Add the x-axis.
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
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

    xAxis.call((g) =>
      g
        .selectAll('.tick line')
        .filter((_, i, __) => i !== 0) // exclude last tick
        .clone()
        .attr('y1', margin.top)
        .classed('stroke-overlay', true)
        .attr('y2', -height + margin.top + margin.bottom),
    )

    // Add the y-axis, remove the domain line, add grid lines and a label.
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => `${d}°`))
      .classed('text-overlay', true)
      .call((g) => g.selectAll('.tick text').classed('text-text-muted', true))
      .call((g) =>
        g
          .selectAll('.tick line')
          .filter((_, i, __) => i !== 0) // exclude last tick
          .clone()
          .attr('x2', width - margin.left - margin.right)
          .classed('stroke-overlay', true),
      )

    svg
      .append('g')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(y2).tickFormat((d) => `${d}mm`))
      .classed('text-overlay', true)
      .call((g) => g.selectAll('.tick text').classed('text-text-muted', true))

    // svg
    //   .append('path')
    //   .attr('stroke-width', 4)
    //   .attr('d', line2(data.multiseries.precipitation_amount))
    //   .attr('stroke', 'royalblue') // skyblue
    //   .attr('fill', 'none')
    //   .attr('clip-path', 'url(#clip)')

    const padding = 2
    svg
      .append('g')
      .selectAll('rect')
      .data(data.multiseries.precipitation_amount)
      .join('rect')
      .attr('x', (d) => {
        const center = d.datetime.toMillis()
        const half = d.duration.toMillis() / 2
        return x(center - half) + padding
      })
      .attr('width', (d) => {
        const start = d.datetime.toMillis()
        const end = start + d.duration.toMillis()
        return x(end) - x(start) - 2 * padding
      })
      .attr('y', (d) => y2(d.value))
      .attr('height', (d) => height - margin.top - y2(d.value))
      .classed('fill-blue-300 opacity-50', true)

    // Append a path for the line.
    svg
      .append('path')
      .attr('stroke-width', 4)
      .attr('d', line(data.multiseries.temperature))
      .attr('stroke', 'url(#line-gradient)')
      .attr('fill', 'none')
      .attr('clip-path', 'url(#clip)')

    const min = -50
    const max = 50
    const steps = 10
    const gradientStops = Array.from({ length: steps + 1 }, (_, i) => {
      // the gradient is inverted, causing the 1 - Ans
      const v = min + (1 - i / steps) * (max - min)
      return {
        offset: `${(i / steps) * 100}%`,
        color: interpolateColor(CONFIG.appearance.colors.temperatureColorStops, v),
      }
    })

    const defs = svg.append('defs')

    const gradient = defs
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', y(max))
      .attr('x2', 0)
      .attr('y2', y(min))

    gradient
      .selectAll('stop')
      .data(gradientStops)
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color)

    const now = new Date()

    svg
      .append('rect')
      .attr('x', margin.left + 1)
      .attr('y', margin.top - 1)
      .attr('width', x(now) - margin.left - margin.right)
      .attr('height', height - margin.bottom - margin.top)
      .classed('fill-midground', true)
      .attr('opacity', 0.7)

    function getNearestPointAtDateTime(
      datetime: DateTime,
      parameter: WeatherMetricKey,
      y: d3.ScaleLinear<number, number>,
    ) {
      if (!data.multiseries?.[parameter]) return null
      const x0 = datetime.toMillis()
      const i = bisect(data.multiseries!.temperature!, x0)
      const d0 = data.multiseries[parameter][i - 1]
      const d1 = data.multiseries[parameter][i]
      const d = !d0 || x0 - d0.datetime.toMillis() > d1.datetime.toMillis() - x0 ? d1 : d0

      return {
        x: x(d.datetime.toMillis()),
        y: y(d.value),
        d,
      }
    }

    function updateXAxisPointer(datetime: DateTime, showTooltip = true) {
      const p = getNearestPointAtDateTime(datetime, 'temperature', y)
      const p2 = getNearestPointAtDateTime(datetime, 'precipitation_amount', y2)
      const points = [p, p2].filter((p) => p !== null)
      const nearest = points.reduce((a, b) => (b.d.datetime.diffNow() < a.d.datetime.diffNow() ? b : a))
      const highest = points.reduce((a, b) => (b.y < a.y ? b : a))
      xAxisPointer.attr('transform', `translate(${nearest.x},0)`)
      xAxisPointer.select('line').attr('y1', highest.y)
      xAxisPointerCircle.attr('cy', p.y)
      xAxisPointerCircle2.attr('cy', p2.y)

      if (!showTooltip) {
        fo.style('display', 'none')
        return
      }

      fo.attr('x', nearest.x + 8)
        .attr('y', p.y - 20)
        .style('display', null)
      tooltip.html(`${p.d.datetime.toFormat('HH:mm')}<br>${p.d.value.toFixed(1)}°<br>${p2.d.value.toFixed(1)}mm`)
    }

    const xAxisPointer = svg.append('g')

    xAxisPointer
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 123)
      .attr('y2', height - margin.top + 5)
      .classed('stroke-text-disabled stroke-2', true)

    const xAxisPointerCircle = xAxisPointer
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 123)
      .attr('r', 4)
      .classed('stroke-midground fill-text stroke-4', true)

    const xAxisPointerCircle2 = xAxisPointer
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 123)
      .attr('r', 4)
      .classed('stroke-midground fill-text stroke-4', true)

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)

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

        const datetime = DateTime.fromMillis(x.invert(startX).getTime())
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
        const datetime = DateTime.fromMillis(x.invert(px).getTime())
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
    container.replaceChildren(svg.node())
  }

  onMount(() => {
    // window.addEventListener('resize', () => chart.resize())
  })

  $effect(() => {
    if (data) updateChart()
  })
</script>

<div class="bg-midground flex flex-col gap-2 rounded-lg p-2">
  <div class="flex flex-row gap-2">
    <Button variant="secondary" size="icon" class="size-8 text-sm">
      <RotateCwIcon />
    </Button>
  </div>
  <!-- NOTE: relative is required on iOS -->
  <div bind:this={container} class="relative h-fit"></div>
</div>
