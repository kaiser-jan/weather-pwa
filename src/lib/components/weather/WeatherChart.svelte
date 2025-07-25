<script lang="ts">
  import { autoFormatMetric, getPreferredUnit } from '$lib/utils/units'
  import type { MultivariateTimeSeries, TimeSeries, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { onDestroy, onMount } from 'svelte'
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
  import { settings } from '$lib/settings/store'
  import type { ColorStop, CreatedSeriesDetails, SeriesDetailsBase } from '$lib/types/ui'
  import { createArea } from '$lib/utils/d3/area'
  import { createUUID, debounce } from '$lib/utils'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { createExtremaMarkers } from '$lib/utils/d3/extrema'
  import { get } from 'svelte/store'
  import ChartValuesDisplay from './ChartValuesDisplay.svelte'

  interface Props {
    multiseries: MultivariateTimeSeries
    unloaded?: boolean
    visibleSeries: WeatherMetricKey[]
    startDateTime: DateTime
    endDateTime: DateTime
    datetime: DateTime
    className: string
  }

  const {
    multiseries: data,
    visibleSeries,
    startDateTime,
    endDateTime,
    datetime: NOW, // TODO: only update whats necessary
    className,
    unloaded,
  }: Props = $props()

  // move axis by half their line width to avoid overlap with content
  const LINE_CORRECTION = 0.5

  const settingsChart = settings.select((s) => s.sections.components.chart)

  let highlightedTimeBucket = $state<Record<WeatherMetricKey, TimeSeriesNumberEntry> | undefined>()

  let container: HTMLDivElement

  let margin = { top: 10, right: 40, bottom: 20, left: 40 }
  let widthFull = 360
  let heightFull = 240

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

  function estimateTextWidth(text: string, font: string = '10px sans-serif'): number {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return 0
    context.font = font
    return context.measureText(text).width
  }

  function updateChart() {
    clearChart()

    margin = { top: 10, right: 0, bottom: 20, left: 0 }

    if ($settingsChart.axisUnits === 'above') {
      margin.top += 10
    }

    let yScaleOffsets: Partial<Record<WeatherMetricKey, number>> = {}
    let yScaleRightCurrentOffset = 0
    let yScaleLeftCurrentOffset = 0

    for (const seriesKey of visibleSeries) {
      const details = CHART_SERIES_DETAILS[seriesKey]
      if (!details || details.hideScale) continue
      const unit = getPreferredUnit(seriesKey, get(settings))
      const hideUnit = $settingsChart.axisUnits !== 'inline'
      const minString = autoFormatMetric(details.domain.min[0], seriesKey, get(settings), { hideUnit })
      const maxString = autoFormatMetric(details.domain.max[details.domain.max.length - 1], seriesKey, get(settings), {
        hideUnit,
      })
      const textWidthMinValue = estimateTextWidth(minString)
      const textWidthUnit = estimateTextWidth(unit ?? '')
      const textWidthMaxValue = estimateTextWidth(maxString)
      const requiredX = Math.max(textWidthMinValue, textWidthUnit, textWidthMaxValue) + 10
      console.debug(minString, maxString, unit)

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
      .attr('transform', `translate(0,${dimensions.margin.top + dimensions.height + 0.5})`)

    const createdSeriesDetails: CreatedSeriesDetails[] = []

    for (const seriesKey of [...visibleSeries].reverse()) {
      const series = data[seriesKey]
      const details = CHART_SERIES_DETAILS[seriesKey]
      if (!series || !details) continue

      const unit = getPreferredUnit(seriesKey, get(settings))
      const format = (d: number) =>
        autoFormatMetric(d, seriesKey, get(settings), {
          hideUnit: get(settings).sections.components.chart.axisUnits !== 'inline',
        })

      const rangeY = [dimensions.height + dimensions.margin.top, margin.top]

      const extent = d3.extent(series, (d) => d.value)
      const min = extent[0] ?? 0
      const max = extent[1] ?? 0

      const domain = [
        details.domain.min.findLast((t) => t <= min * 0.9) ?? details.domain.min[0],
        details.domain.max.find((t) => t >= max * 1.1) ?? details.domain.max[0],
      ]

      const scaleY = d3.scaleLinear(domain, rangeY) //.nice()

      if (!details.hideScale) {
        const xOffset =
          dimensions.margin.left +
          (details.scaleOnRight ? dimensions.width : 0) +
          (details.scaleOnRight ? LINE_CORRECTION : -LINE_CORRECTION) +
          (yScaleOffsets[seriesKey] ?? 0)

        createYAxis({
          svg,
          dimensions,
          scale: scaleY,
          side: details.scaleOnRight ? 'right' : 'left',
          addLines: false,
          unit,
          format,
        }) //
          .attr('transform', `translate(${xOffset},${LINE_CORRECTION})`)
      }

      const clipId = 'clip-' + createUUID()
      svg
        .append('defs')
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('x', dimensions.margin.left)
        .attr('y', dimensions.margin.top)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)

      function addDataRepresentation(
        seriesKey: string,
        seriesA: TimeSeries<number> | undefined,
        details: SeriesDetailsBase,
        seriesB?: TimeSeries<number> | undefined,
      ) {
        if (!seriesA || !details) return

        let dataRepresentation: d3.Selection<any, any, any, undefined>

        const color = details.color && 'tailwind' in details.color ? details.color.tailwind : undefined
        switch (details.style) {
          case 'line':
            dataRepresentation = createLine({ svg, dimensions, scaleX, scaleY, data: seriesA }) //
            if (color) dataRepresentation.classed(color.stroke, true)
            break
          case 'bars':
            dataRepresentation = createBars({ svg, dimensions, scaleX, scaleY, data: seriesA }) //
            if (color) dataRepresentation.classed(color.fill, true)
            break
          case 'area':
            if (!seriesB) return
            dataRepresentation = createArea({ svg, dimensions, scaleX, scaleY, dataA: seriesA, dataB: seriesB }) //
            if (color) dataRepresentation.classed(color.fill, true)
            break
        }

        dataRepresentation.classed([details.class].join(' '), true)

        dataRepresentation.attr('clip-path', `url(#${clipId})`)

        const gradientColorStops =
          details.color && 'gradient' in details.color
            ? details.color.gradient
            : details.color && 'gradientSetting' in details.color
              ? (settings.readSetting(details.color.gradientSetting).value as ColorStop[])
              : undefined

        if (gradientColorStops) {
          const gradientId = createGradientDefinition({
            svg,
            scaleY,
            stops: gradientColorStops,
            name: seriesKey,
          })

          dataRepresentation.attr('stroke', `url(#${gradientId})`)
          if (details.style === 'area') dataRepresentation.attr('fill', `url(#${gradientId})`)
        }

        if (details.markExtrema && $settingsChart.highlightExtrema) {
          createExtremaMarkers({ svg, dimensions, scaleX, scaleY, data: seriesA, format })
        }
      }

      if (details.include) {
        for (const [includeParameter, includeDetails] of Object.entries(details.include)) {
          const includeSeriesA = data[includeParameter as WeatherMetricKey]
          const includeSeriesB = data[includeDetails.areaSecondParameter as WeatherMetricKey]
          addDataRepresentation(includeParameter, includeSeriesA, includeDetails, includeSeriesB)
        }
      }

      addDataRepresentation(seriesKey, series, details)

      createdSeriesDetails.push({ ...details, name: seriesKey, scale: scaleY, data: series })
    }

    svg
      .append('rect')
      .attr('x', dimensions.margin.left)
      .attr('y', dimensions.margin.top)
      .attr('width', scaleX(NOW) - dimensions.margin.left)
      .attr('height', dimensions.height)
      .classed('fill-midground', true)
      .attr('opacity', 0.7)

    const { updateXAxisPointer, hideXAxisPointer } = createAxisPointer({
      svg,
      dimensions,
      scaleX,
      seriesList: createdSeriesDetails,
      tooltip: $settingsChart.tooltip,
    })

    function selectDatetime(datetime: DateTime | null) {
      const isToday = NOW >= startDateTime && NOW <= endDateTime
      const isManual = datetime !== null

      if (!isManual && !isToday) {
        hideXAxisPointer()
        highlightedTimeBucket = undefined
        return
      }

      const points = updateXAxisPointer(datetime ?? NOW, isManual)
      const timebucket = Object.fromEntries(points.map((p) => [p.name, p.d])) as Record<
        WeatherMetricKey,
        TimeSeriesNumberEntry
      >

      highlightedTimeBucket = timebucket
    }

    handleInteraction({
      svg,
      onLongPress: (e) => {
        const [px] = d3.pointer(e)
        const datetime = DateTime.fromMillis(scaleX.invert(px).getTime())
        selectDatetime(datetime)
      },
      onScrollX: (e) => {
        const [px] = d3.pointer(e)
        const datetime = DateTime.fromMillis(scaleX.invert(px).getTime())
        selectDatetime(datetime)
      },
      onSwipeX: (_) => {},
      onRelease: (_) => {
        selectDatetime(null)
      },
    })

    selectDatetime(null)

    const node = svg.node()
    if (!node) {
      console.warn('D3 Weather Chart resulted in no node to add!')
      return
    }

    container.replaceChildren(node)
  }

  function resizeChart() {
    if (!container) return
    widthFull = container.clientWidth
    heightFull = container.clientHeight
    dimensions = computeDimensions()
    updateChart()
  }

  const debouncedResizeChart = debounce(resizeChart, 50)

  onMount(() => {
    resizeChart()
    window.addEventListener('resize', debouncedResizeChart)
  })

  onDestroy(() => {
    window.removeEventListener('resize', debouncedResizeChart)
  })

  $effect(() => {
    if (unloaded) {
      clearChart()
      return
    }
    if (data && visibleSeries.length) updateChart()
  })
</script>

<ChartValuesDisplay parameters={visibleSeries} {highlightedTimeBucket} />
<div bind:this={container} class={['relative', className]}>
  <Skeleton class="h-full w-full" />
</div>
