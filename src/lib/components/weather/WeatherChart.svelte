<script lang="ts">
  import type { MultivariateTimeSeries, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import { DateTime } from 'luxon'
  import { createXAxis, createYAxis } from '$lib/utils/d3/axis'
  import type { Dimensions } from '$lib/utils/d3/types'
  import { createBars } from '$lib/utils/d3/bars'
  import { createLine } from '$lib/utils/d3/line'
  import { createGradientDefinition } from '$lib/utils/d3/gradient'
  import { createAxisPointer } from '$lib/utils/d3/axisPointer'
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import { handleInteraction } from '$lib/utils/d3/interaction'
  import { CONFIG } from '$lib/config'
  import type { CreatedSeriesDetails } from '$lib/types/ui'

  interface Props {
    multiseries: MultivariateTimeSeries
    loaded: boolean
    visibleSeries: WeatherMetricKey[]
    startDateTime: DateTime
    endDateTime: DateTime
    className: string
    ontimestamp: (timebucket: Record<WeatherMetricKey, TimeSeriesNumberEntry> | null) => void
  }

  const {
    multiseries: data,
    visibleSeries,
    startDateTime,
    endDateTime,
    className,
    loaded,
    ontimestamp = $bindable(),
  }: Props = $props()

  let container: HTMLDivElement

  let margin = { top: 10, right: 40, bottom: 20, left: 40 }
  const widthFull = 360
  const heightFull = 240

  let dimensions: Dimensions = computeDimensions()

  function computeDimensions() {
    return {
      width: widthFull - margin.left - margin.right,
      height: heightFull - margin.top - margin.bottom,
      widthFull,
      heightFull,
      margin,
    }
  }

  function clearChart() {
    d3.select(container).selectAll('*').remove()
  }

  function estimateTextWidth(text: string, font: string = '12px sans-serif'): number {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return 0
    context.font = font
    return context.measureText(text).width
  }

  function updateChart() {
    clearChart()

    margin = { top: 10, right: 0, bottom: 20, left: 0 }

    let yScaleOffsets: Partial<Record<WeatherMetricKey, number>> = {}
    let yScaleRightCurrentOffset = 0
    let yScaleLeftCurrentOffset = 0

    for (const seriesKey of visibleSeries) {
      const details = CHART_SERIES_DETAILS[seriesKey]
      if (!details || details.hideScale) continue
      const maxString = details.domain[1].toFixed(0) + details.unit

      const requiredX = estimateTextWidth(maxString) + 10
      if (details.scaleOnRight) {
        margin['right'] += requiredX
        yScaleOffsets[seriesKey] = yScaleRightCurrentOffset
        yScaleRightCurrentOffset += requiredX
      } else {
        margin['left'] += requiredX
        yScaleOffsets[seriesKey] = yScaleLeftCurrentOffset
        yScaleLeftCurrentOffset -= requiredX
      }
    }
    dimensions = computeDimensions()

    const svg = d3
      .select(container)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${dimensions.widthFull} ${dimensions.heightFull}`)

    // Declare the x (horizontal position) scale.
    // const minTime = d3.min(data.multiseries.temperature, (d) => d.datetime.toMillis())!
    const scaleX = d3.scaleUtc([startDateTime, endDateTime], [dimensions.margin.left, dimensions.width + margin.left])

    createXAxis({ svg, dimensions, scale: scaleX, addLines: true }) //
      .attr('transform', `translate(0,${dimensions.margin.top + dimensions.height})`)

    const createdSeriesDetails: CreatedSeriesDetails[] = []

    for (const seriesKey of [...visibleSeries].reverse()) {
      const series = data[seriesKey]
      if (!series) return

      const details = CHART_SERIES_DETAILS[seriesKey]
      if (!details) continue

      const rangeY = [dimensions.height + dimensions.margin.top, margin.top]
      const scaleY = d3.scaleLinear(details.domain, rangeY)

      if (!details.hideScale) {
        createYAxis({
          svg,
          dimensions,
          scale: scaleY,
          side: details.scaleOnRight ? 'right' : 'left',
          unit: details.unit,
          addLines: false,
        }) //
          .attr(
            'transform',
            `translate(${dimensions.margin.left + (details.scaleOnRight ? dimensions.width : 0) + yScaleOffsets[seriesKey]},0)`,
          )
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
      .attr('width', scaleX(DateTime.now()) - dimensions.margin.left)
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

    const { updateXAxisPointer } = createAxisPointer({
      svg,
      dimensions,
      scaleX,
      seriesList: createdSeriesDetails,
      tooltip: CONFIG.chart.tooltip,
    })

    handleInteraction({
      svg,
      onLongPress: (e) => {
        const datetime = DateTime.fromMillis(scaleX.invert(e.clientX).getTime())
        updateXAxisPointer(datetime)
      },
      onScrollX: (e) => {
        const [px] = d3.pointer(e)
        const datetime = DateTime.fromMillis(scaleX.invert(px).getTime())
        const points = updateXAxisPointer(datetime)
        const timebucket = Object.fromEntries(points.map((p) => [p.name, p.d])) as Record<
          WeatherMetricKey,
          TimeSeriesNumberEntry
        >
        ontimestamp(timebucket)
      },
      onSwipeX: (_) => {
        updateXAxisPointer(DateTime.now(), false)
      },
      onRelease: (_) => {
        updateXAxisPointer(DateTime.now(), false)
        ontimestamp(null)
      },
    })

    container.replaceChildren(svg.node())
  }

  onMount(() => {
    // window.addEventListener('resize', () => chart.resize())
  })

  $effect(() => {
    if (!loaded) {
      clearChart()
      return
    }
    if (data && visibleSeries.length) updateChart()
  })
</script>

<div bind:this={container} class={['relative h-fit', className]}></div>
