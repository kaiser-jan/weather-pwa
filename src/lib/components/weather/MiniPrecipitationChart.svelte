<script lang="ts">
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import type { TimeSeries } from '$lib/types/data'
  import { createBars } from '$lib/utils/d3/bars'
  import * as d3 from 'd3'

  interface Props {
    timeseries: TimeSeries<number>
  }

  const { timeseries }: Props = $props()

  let svgEl: SVGSVGElement

  const margin = { top: 0, right: 0, bottom: 0, left: 0 }
  const widthFull = 64
  const heightFull = 16

  // TODO: this should be configured via props
  const scaleFactor = $derived.by(() => {
    const start = timeseries[0].timestamp
    const end = timeseries[timeseries.length - 1].timestamp + timeseries[timeseries.length - 1].duration
    const hourReferenceCount = 6
    const scale = (end - start) / 3600_000 / hourReferenceCount
    return Math.min(1, scale)
  })

  $effect(() => {
    if (svgEl && timeseries.length) update()
  })

  function update() {
    const details = METRIC_DETAILS.precipitation_amount!

    const dimensions = {
      width: widthFull - margin.left - margin.right,
      height: heightFull - margin.top - margin.bottom,
      widthFull,
      heightFull,
      margin,
    }

    const extent = d3.extent(timeseries, (d) => d.value)
    const min = extent[0] ?? 0
    const max = extent[1] ?? 0
    const domain = [
      details.domain.min.findLast((t) => t <= min * 0.9) ?? details.domain.min[0],
      details.domain.max.find((t) => t >= max * 1.1) ?? details.domain.max[0],
    ] as const

    const start = timeseries[0].timestamp
    const end = timeseries[timeseries.length - 1].timestamp + timeseries[timeseries.length - 1].duration

    const scaleX = d3.scaleTime().domain([start, end]).range([0, dimensions.width])
    const scaleY = d3
      .scaleSqrt()
      .exponent(1 / 4)
      .domain(domain)
      .range([dimensions.height, 0])

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()
    svg
      // .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${dimensions.widthFull} ${dimensions.heightFull}`)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const bars = createBars({ svg, dimensions, scaleX, scaleY, data: timeseries, padding: 0 }) //

    const colorStyle = details.color
    const color = colorStyle && 'css' in colorStyle ? colorStyle.css : undefined
    if (color) bars.style('fill', color)
    if ('categories' in colorStyle)
      bars.attr('fill', (d) => {
        const color = colorStyle.categories.findLast((c) => d.value > c.value)
        if (!color) return 'red'
        return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a ?? 1})`
      })
  }
</script>

<svg bind:this={svgEl} width={widthFull * scaleFactor} height={heightFull * scaleFactor}></svg>
