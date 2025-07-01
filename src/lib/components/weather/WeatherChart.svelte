<script lang="ts">
  import type { Forecast, TimePeriod, TimeSeries, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { onMount } from 'svelte'
  import { Button } from '../ui/button'
  import { RotateCwIcon } from 'lucide-svelte'
  import * as d3 from 'd3'
  import { DateTime } from 'luxon'
  import { CONFIG } from '$lib/config'
  import { interpolateColor } from '$lib/utils/ui'
  import { createXAxis, createYAxis } from '$lib/utils/d3/axis'
  import type { Dimensions } from '$lib/utils/d3/types'
  import { createBars } from '$lib/utils/d3/bars'
  import { createLine } from '$lib/utils/d3/line'
  import { createGradientDefinition } from '$lib/utils/d3/gradient'
  import { createAxisPointer } from '$lib/utils/d3/axisPointer'
  import type { ColorStop } from '$lib/types/ui'

  interface Props {
    data: Partial<Forecast>
  }

  const { data }: Props = $props()

  let container: HTMLDivElement

  interface SeriesDetails {
    domain: [number, number]
    style: 'line' | 'bars'
    class: string
    formatter: (d: number) => string
    hideScale?: boolean
    scaleOnRight?: boolean
    gradientColorStops?: ColorStop[]
    invert?: boolean
  }

  let visibleSeries: WeatherMetricKey[] = ['cloud_coverage', 'precipitation_amount', 'temperature']

  let seriesDetails: Partial<Record<WeatherMetricKey, SeriesDetails>> = {
    temperature: {
      domain: [0, 40],
      style: 'line',
      class: '',
      formatter: (d) => `${d}°`,
      gradientColorStops: CONFIG.appearance.colors.temperatureColorStops,
    },
    cloud_coverage: {
      domain: [0, 1],
      style: 'bars',
      class: 'fill-blue-200 opacity-15',
      formatter: (d) => `${d * 100}%`,
      hideScale: true,
      // TODO: implement invert
      invert: true,
    },
    precipitation_amount: {
      domain: [0, 50],
      style: 'bars',
      class: 'fill-blue-300 opacity-80',
      formatter: (d) => `${d.toFixed(1)}mm`,
      scaleOnRight: true,
    },
  }

  const margin = { top: 10, right: 35, bottom: 20, left: 25 }
  const widthFull = 360
  const heightFull = 240
  const dimensions: Dimensions = {
    width: widthFull - margin.left - margin.right,
    height: heightFull - margin.top - margin.bottom,
    widthFull,
    heightFull,
    margin,
  }

  function updateChart() {
    // 2. Create the SVG for the chart
    //    Use the width and height in setting the viewBox
    const svg = d3
      .select(container)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${dimensions.widthFull} ${dimensions.heightFull}`)

    // Declare the x (horizontal position) scale.
    // const minTime = d3.min(data.multiseries.temperature, (d) => d.datetime.toMillis())!
    const scaleX = d3.scaleUtc(
      [
        DateTime.now().plus({ days: 0 }).startOf('day').toMillis(),
        DateTime.now().plus({ days: 0 }).endOf('day').toMillis(),
      ],
      [dimensions.margin.left, dimensions.width + margin.right],
    )

    createXAxis({ svg, dimensions, scale: scaleX, addLines: true }) //
      .attr('transform', `translate(0,${dimensions.margin.top + dimensions.height})`)

    const createdSeriesDetails: (SeriesDetails & {
      name: string
      scale: d3.ScaleLinear<number, number, never>
      data: TimeSeries<number>
    })[] = []

    for (const seriesKey of visibleSeries) {
      const series = data.multiseries?.[seriesKey]
      if (!series) return

      const details = seriesDetails[seriesKey]
      if (!details) continue

      const rangeY = [dimensions.height + dimensions.margin.top, margin.top]
      const scaleY = d3.scaleLinear(details.domain, rangeY)

      if (!details.hideScale) {
        createYAxis({
          svg,
          dimensions,
          scale: scaleY,
          side: details.scaleOnRight ? 'right' : 'left',
          formatter: details.formatter,
          addLines: false,
        }) //
          .attr('transform', `translate(${dimensions.margin.left + (details.scaleOnRight ? dimensions.width : 0)},0)`)
      }

      const gradientId = `gradient-${seriesKey}`

      let dataRepresentation: d3.Selection<any, any, any, undefined>
      switch (details.style) {
        case 'line':
          dataRepresentation = createLine({ svg, dimensions, scaleX, scaleY, data: series }) //
          break
        case 'bars':
          dataRepresentation = createBars({ svg, dimensions, scaleX, scaleY, data: series }) //
          break
      }

      dataRepresentation.classed([details.class].join(' '), true)

      if (details.gradientColorStops) {
        createGradientDefinition({
          svg,
          dimensions,
          scaleY,
          stops: details.gradientColorStops,
          id: gradientId,
        })

        dataRepresentation.attr('stroke', `url(#${gradientId})`)
      }

      createdSeriesDetails.push({ ...details, name: seriesKey, scale: scaleY, data: series })
    }

    svg
      .append('rect')
      .attr('x', dimensions.margin.left + 1)
      .attr('y', dimensions.margin.top - 1)
      .attr('width', scaleX(DateTime.now()) - dimensions.margin.right)
      .attr('height', dimensions.height)
      .classed('fill-midground', true)
      .attr('opacity', 0.7)

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', dimensions.margin.left)
      .attr('y', dimensions.margin.top)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    createAxisPointer({
      svg,
      dimensions,
      scaleX,
      seriesList: createdSeriesDetails,
    })

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
