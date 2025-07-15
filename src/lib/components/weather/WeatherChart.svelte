<script lang="ts">
  import { convertAndFormatMetric, convertToUnit, formatMetric, getPreferredUnit } from '../../utils/units'
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
  import type { CreatedSeriesDetails, SeriesDetails, SeriesDetailsBase } from '$lib/types/ui'
  import { createArea } from '$lib/utils/d3/area'
  import { debounce } from '$lib/utils'
  import { Skeleton } from '../ui/skeleton'

  interface Props {
    multiseries: MultivariateTimeSeries
    loaded: boolean
    visibleSeries: WeatherMetricKey[]
    startDateTime: DateTime
    endDateTime: DateTime
    className: string
    onHighlightTimestamp: (timebucket: Record<WeatherMetricKey, TimeSeriesNumberEntry> | null) => void
    onCurrentTimestamp: (timebucket: Record<WeatherMetricKey, TimeSeriesNumberEntry>) => void
  }

  const {
    multiseries: data,
    visibleSeries,
    startDateTime,
    endDateTime,
    className,
    loaded,
    onHighlightTimestamp = $bindable(),
    onCurrentTimestamp = $bindable(),
  }: Props = $props()

  const settingsChart = settings.select((s) => s.sections.chart)

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
      const unit = getPreferredUnit(seriesKey)
      const unitInline = $settingsChart.axisUnits === 'inline' ? unit : null
      const minString = convertAndFormatMetric(details.domain[0], seriesKey, unitInline)
      const maxString = convertAndFormatMetric(details.domain[1], seriesKey, unitInline)
      const textWidthMinValue = estimateTextWidth(minString)
      const textWidthUnit = estimateTextWidth(unit ?? '')
      const textWidthMaxValue = estimateTextWidth(maxString)
      const requiredX = Math.max(textWidthMinValue, textWidthUnit, textWidthMaxValue) + 10

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
      const unit = getPreferredUnit(seriesKey)
      const unitConversion = (d: number) => convertToUnit(d, seriesKey, unit)

      const useSeries = (parameter: keyof typeof data) => {
        return data[parameter]?.map((d) => ({ ...d, value: unitConversion(d.value) }))
      }

      const series = useSeries(seriesKey)
      const details = CHART_SERIES_DETAILS[seriesKey]
      if (!series || !details) continue

      const rangeY = [dimensions.height + dimensions.margin.top, margin.top]
      const scaleY = d3.scaleLinear(details.domain.map(unitConversion), rangeY) //.nice()

      if (!details.hideScale) {
        const format = (d: number) => formatMetric(d, unit)

        createYAxis({
          svg,
          dimensions,
          scale: scaleY,
          side: details.scaleOnRight ? 'right' : 'left',
          format,
          unit,
          addLines: false,
        }) //
          .attr(
            'transform',
            `translate(${dimensions.margin.left + (details.scaleOnRight ? dimensions.width : 0) + yScaleOffsets[seriesKey]},0)`,
          )
      }

      function addDataRepresentation(
        seriesKey: string,
        seriesA: TimeSeries<number> | undefined,
        details: SeriesDetailsBase,
        seriesB?: TimeSeries<number> | undefined,
      ) {
        if (!seriesA || !details) return

        let dataRepresentation: d3.Selection<any, any, any, undefined>
        switch (details.style) {
          case 'line':
            dataRepresentation = createLine({ svg, dimensions, scaleX, scaleY, data: seriesA }) //
            break
          case 'bars':
            dataRepresentation = createBars({ svg, dimensions, scaleX, scaleY, data: seriesA }) //
            break
          case 'area':
            dataRepresentation = createArea({ svg, dimensions, scaleX, scaleY, dataA: seriesA, dataB: seriesB }) //
            break
        }

        dataRepresentation.classed([details.class].join(' '), true)

        if (details.gradientColorStops) {
          const gradientId = `gradient-${seriesKey}`

          createGradientDefinition({
            svg,
            scaleY,
            stops: details.gradientColorStops.map((s) => ({ ...s, value: unitConversion(s.value) })),
            id: gradientId,
          })

          dataRepresentation.attr('stroke', `url(#${gradientId})`)
          if (details.style === 'area') dataRepresentation.attr('fill', `url(#${gradientId})`)
        }
      }

      addDataRepresentation(seriesKey, series, details)

      if (details.include) {
        for (const [includeParameter, includeDetails] of Object.entries(details.include)) {
          const includeSeriesA = useSeries(includeParameter as WeatherMetricKey)
          const includeSeriesB = useSeries(includeDetails.areaSecondParameter as WeatherMetricKey)
          addDataRepresentation(includeParameter, includeSeriesA, includeDetails, includeSeriesB)
        }
      }

      createdSeriesDetails.push({ ...details, name: seriesKey, scale: scaleY, data: series })
    }

    svg
      .append('rect')
      .attr('x', dimensions.margin.left + 0.25)
      .attr('y', dimensions.margin.top - 0.25)
      .attr('width', scaleX(DateTime.now()) - dimensions.margin.left)
      .attr('height', dimensions.height)
      .classed('fill-midground', true)
      .attr('opacity', 0.7)

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', dimensions.margin.left + 0.25)
      .attr('y', dimensions.margin.top)
      .attr('width', dimensions.width - 0.25)
      .attr('height', dimensions.height)

    const { updateXAxisPointer } = createAxisPointer({
      svg,
      dimensions,
      scaleX,
      seriesList: createdSeriesDetails,
      tooltip: $settingsChart.tooltip,
    })

    function selectDatetime(datetime: DateTime | null) {
      const now = DateTime.now()
      const isToday = now >= startDateTime && now <= endDateTime
      const isManual = datetime !== null

      if (!isManual && !isToday) {
        updateXAxisPointer(null, false)
        onHighlightTimestamp(null)
        return
      }

      const points = updateXAxisPointer(datetime ?? now, isManual)
      const timebucket = Object.fromEntries(points.map((p) => [p.name, p.d])) as Record<
        WeatherMetricKey,
        TimeSeriesNumberEntry
      >

      if (!isManual) {
        onCurrentTimestamp(timebucket)
        onHighlightTimestamp(null)
      } else {
        onHighlightTimestamp(timebucket)
      }
    }

    handleInteraction({
      svg,
      onLongPress: (e) => {
        const datetime = DateTime.fromMillis(scaleX.invert(e.clientX).getTime())
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

    container.replaceChildren(svg.node())
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
    if (!loaded) {
      clearChart()
      return
    }
    if (data && visibleSeries.length) updateChart()
  })
</script>

<div bind:this={container} class={['relative', className]}>
  <Skeleton class="h-full w-full" />
</div>
