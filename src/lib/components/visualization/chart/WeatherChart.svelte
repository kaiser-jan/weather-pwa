<script lang="ts">
  import type { MultivariateTimeSeries, TimeSeries, TimeSeriesNumberEntry, ForecastParameter } from '$lib/types/data'
  import { onDestroy, onMount } from 'svelte'
  import * as d3 from 'd3'
  import { createXAxis, createYAxis } from '$lib/utils/d3/axis'
  import type { Dimensions } from '$lib/utils/d3/types'
  import { createBars, createBarsStacked } from '$lib/utils/d3/bars'
  import { createLine } from '$lib/utils/d3/line'
  import { createGradientDefinition } from '$lib/utils/d3/gradient'
  import { createAxisPointer } from '$lib/utils/d3/axisPointer'
  import { METRIC_DETAILS, useCategoriesForColor, type ForecastMetric } from '$lib/config/metrics'
  import { handleInteraction } from '$lib/utils/d3/interaction'
  import { settings } from '$lib/stores/settings'
  import type { CreatedSeriesDetails, MetricDetails } from '$lib/types/ui'
  import { createArea } from '$lib/utils/d3/area'
  import { createUUID, debounce } from '$lib/utils/common'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { createExtremaMarkers } from '$lib/utils/d3/extrema'
  import ChartValuesDisplay from './ChartValuesDisplay.svelte'
  import { computeAxesFor } from '$lib/utils/d3/autoAxis'
  import ParameterSelect from './ParameterSelect.svelte'
  import { NOW_MILLIS } from '$lib/stores/now'
  import { colorToCss } from '$lib/utils/color'
  import type { Forecast } from '$lib/types/metno'
  import { mapRecord, removeDuplicates } from '$lib/utils'
  import { DateTime, Duration } from 'luxon'
  import { convertToUnit, getPreferredUnit } from '$lib/utils/units'
  import { get } from 'svelte/store'

  interface Props {
    multiseries: MultivariateTimeSeries
    parameters: ForecastMetric[]
    startTimestamp: number
    endTimestamp: number
    className: string
    location: 'overview' | 'day' | 'outlook'
    onclick?: () => void
    rollup?: boolean
  }

  let {
    multiseries,
    parameters = $bindable(),
    startTimestamp,
    endTimestamp,
    className,
    location,
    onclick,
    rollup,
  }: Props = $props()

  const parameterSelect = $derived.by(() => {
    switch ($settingsChart.parameterSelect) {
      case 'overview':
        return location === 'overview'
      case 'except-overview':
        return location !== 'overview'
      case 'always':
        return true
      case 'never':
        return false
    }
  })

  const showYAxes = $derived.by(() => {
    switch ($settingsChart.showYAxes) {
      case 'except-overview':
        return location !== 'overview'
      case 'always':
        return true
      case 'never':
        return false
    }
  })

  // move axis by half their line width to avoid overlap with content
  const LINE_CORRECTION = 0.5

  const settingsChart = settings.select((s) => s.sections.components.chart)

  let highlightedTimeBucket = $state<Record<ForecastParameter, TimeSeriesNumberEntry> | undefined>()

  let container: HTMLButtonElement

  function getInitialMargin() {
    return { top: showYAxes ? 12 : 0, right: 0, bottom: 20, left: 0 }
  }
  let margin = { ...getInitialMargin() }
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

  // TODO: consider shifting points to the center of the day -> but not bars!
  function rollupMultiseries() {
    return mapRecord(multiseries, (series, p) =>
      d3
        .rollups(
          series,
          (v) => {
            if (!(p in METRIC_DETAILS)) return 'median'
            const details = METRIC_DETAILS[p as keyof typeof METRIC_DETAILS]
            // TODO: there should be an extra sum field for aggreageted metrics
            // => needs to be respected by axis, data representation, axis pointer, etc.
            const value = details.isAggregated //
              ? d3.mean(v, (d) => d.value)
              : d3.median(v, (d) => d.value)

            return {
              value,
              // value: d3.median(v, (d) => d.value)!,
              min: d3.min(v, (d) => d.value)!,
              max: d3.max(v, (d) => d.value)!,
              timestamp: v[0].timestamp,
              // timestamp: v[0].timestamp + Duration.fromObject({ hours: 12 }).toMillis(),
              duration: v[v.length - 1].timestamp + v[v.length - 1].duration - v[0].timestamp,
            }
          },
          (d) => DateTime.fromMillis(d.timestamp).startOf('day').toMillis(),
          // (d) => DateTime.fromMillis(d.timestamp).startOf('day').plus({ hours: 12 }).toMillis(),
        )
        .map((r) => r[1]),
    )
  }

  // TODO: only update whats necessary
  function updateChart() {
    clearChart()

    const data = rollup ? rollupMultiseries() : multiseries

    margin = { ...getInitialMargin() }

    if ($settingsChart.axisUnits === 'above') {
      margin.top += 10
    }

    dimensions = computeDimensions()

    const availableMetrics: ForecastMetric[] = []

    const axesToCompute: {
      parameter: ForecastMetric
      series: TimeSeries<number>
      details: MetricDetails
    }[] = []

    // iterate over the parameters and prepare axis computations
    // this is required as it needs to be clear what axes are required before computing them
    for (const parameter of parameters) {
      const series = data[parameter]
      const details = METRIC_DETAILS[parameter]
      if (!series || !details) continue

      axesToCompute.push({ parameter, series, details })
      // only display metrics which are available / have data
      availableMetrics.push(parameter)
    }

    // TODO: for rollup this needs to consider extremas
    const computedAxisList = computeAxesFor(axesToCompute, dimensions, data, !showYAxes)

    // compute new dimensions with margin changed by axes
    dimensions = computeDimensions()

    const svg = d3
      .select(container)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${dimensions.widthFull} ${dimensions.heightFull}`)

    // add a placeholder if no metric is available
    if (!availableMetrics.length) {
      svg
        .append('foreignObject')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', dimensions.widthFull)
        .attr('height', dimensions.heightFull)
        .append('xhtml:div')
        .classed('flex justify-center items-center h-full w-full', true)
        .append('xhtml:span')
        .text(parameters.length ? 'No data available for your selection!' : 'Select a forecast metric to plot!')
        .classed('text-lg text-center vertical-middle fill-text-muted font-bold', true)
      return
    }

    const scaleX = d3.scaleUtc([startTimestamp, endTimestamp], [dimensions.margin.left, dimensions.width + margin.left])

    createXAxis({ svg, dimensions, scale: scaleX, addLines: true }) //
      .attr('transform', `translate(0,${dimensions.margin.top + dimensions.height + LINE_CORRECTION})`)

    const createdSeriesDetails: CreatedSeriesDetails[] = []

    for (const parameter of parameters) {
      const series = data[parameter]
      const details = METRIC_DETAILS[parameter]
      const axisComputation = computedAxisList[parameter]
      if (!series || !details || !axisComputation) continue

      const { scaleY, format, axis, unit } = axisComputation

      // add the y axis
      if (axis) {
        const xOffset =
          axis.side === 'left'
            ? dimensions.margin.left - axis.offset - LINE_CORRECTION
            : dimensions.widthFull - dimensions.margin.right + axis.offset - LINE_CORRECTION

        createYAxis({
          svg,
          dimensions,
          scale: scaleY,
          side: axis.side,
          addLines: false,
          unit,
          format,
        }) //
          .attr('transform', `translate(${xOffset},${LINE_CORRECTION})`)
      }

      // create a clip path to hide overflow
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

      if (rollup) {
        if (details.chart.style === 'line') {
          addDataRepresentation(
            parameter,
            data[parameter]!.map((v) => ({ ...v, value: v.min })),
            {
              ...details,
              chart: {
                class: 'opacity-60',
                style: 'area',
                markExtrema: details.chart.markExtrema,
              },
            },
            true,
            data[parameter]!.map((v) => ({ ...v, value: v.max })),
          )
        }
      }

      function addDataRepresentation(
        parameter: ForecastParameter,
        seriesA: TimeSeries<number> | undefined,
        details: MetricDetails,
        isIndirect?: boolean,
        seriesB?: TimeSeries<number> | undefined,
      ) {
        if (!seriesA || !details) return

        let dataRepresentation: d3.Selection<any, any, any, undefined>

        const colorStyle = details.color
        const color = colorStyle && 'css' in colorStyle ? colorStyle.css : undefined

        for (const marker of details.chart.markers ?? []) {
          const value = convertToUnit(marker.value, parameter, getPreferredUnit(parameter, get(settings)))
          svg
            .append('line')
            .attr('x1', dimensions.margin.left)
            .attr('x2', dimensions.margin.left + dimensions.width)
            .attr('y1', scaleY(value))
            .attr('y2', scaleY(value))
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.5)
            .classed(marker.class, true)
        }

        switch (details.chart.style) {
          case 'line':
            dataRepresentation = createLine({ svg, dimensions, scaleX, scaleY, data: seriesA }) //
            if (color) dataRepresentation.style('stroke', color)
            break

          case 'bars':
            // HACK: do not stack with others when indirect (included by another metric)
            let stackKeys =
              details.chart.stacksWith && !isIndirect ? [...details.chart.stacksWith, parameter] : [parameter]
            stackKeys = stackKeys.filter((k) => parameters.includes(k as ForecastMetric))
            // NOTE: parameters might be added indirectly via include
            stackKeys.push(parameter)
            stackKeys = removeDuplicates(stackKeys)

            // TODO: consider filtering/combining in advance
            // HACK: skip drawing if it was included in the stacked bars of another metric
            const hasBeenStackedAlready = parameters
              .slice(0, parameters.indexOf(parameter as ForecastMetric))
              .some((p) => METRIC_DETAILS[p].chart.stacksWith?.includes(parameter))

            if (hasBeenStackedAlready) return

            // color each bar based on its value
            const fillCallback: Parameters<typeof createBarsStacked>[0]['fillCallback'] = (series, point) => {
              const details = METRIC_DETAILS[series.key as ForecastMetric]
              if ('css' in details.color) return details.color.css
              const category = details?.categories?.findLast((c) => point.data.value[series.key] > c.threshold)
              if (!category) return 'red'
              return colorToCss(category.color!)
            }

            const bars = createBarsStacked({
              svg,
              dimensions,
              scaleX,
              scaleY,
              data,
              keys: stackKeys,
              fillCallback,
            }) //

            if (color) bars.style('fill', color)

            dataRepresentation = bars
            break

          case 'area':
            dataRepresentation = createArea({ svg, dimensions, scaleX, scaleY, dataA: seriesA, dataB: seriesB! }) //
            if (color) dataRepresentation.style('fill', color)
            break
        }

        dataRepresentation.classed([details.chart.class].join(' '), true)

        dataRepresentation.attr('clip-path', `url(#${clipId})`)

        // TODO: unify with other color usages
        const gradientColorStops = useCategoriesForColor(details) ? details.categories : undefined

        // create and apply the gradient color
        const isAbrupt = 'type' in details.color && details.color.type === 'segments'
        // segmented color for bars colors them by height instead of applying an abrupt gradient
        const isSegmentedBars = details.chart.style === 'bars' && isAbrupt

        if (gradientColorStops && !isSegmentedBars) {
          const gradientId = createGradientDefinition({
            svg,
            scale: scaleY,
            direction: 'y',
            stops: gradientColorStops,
            name: parameter,
            abrupt: isAbrupt,
          })

          dataRepresentation.attr(details.chart.style === 'line' ? 'stroke' : 'fill', `url(#${gradientId})`)
        }

        if (details.chart.markExtrema && $settingsChart.highlightExtrema && (!rollup || isIndirect)) {
          createExtremaMarkers({ svg, dimensions, scaleX, scaleY, data: seriesA, dataB: seriesB, format })
        }
      }

      createdSeriesDetails.push({ details, parameter, scale: scaleY, data: series })

      // finally add the data representation for the current metric
      addDataRepresentation(parameter, series, details)

      // add the additional series a metric requires (e.g. wind gust speed)
      if (details.chart.include) {
        for (const [includeParameter, includeDetails] of Object.entries(details.chart.include)) {
          const includeSeriesA = data[includeParameter as ForecastParameter]
          const includeSeriesB = data[includeDetails.chart.areaSecondParameter as ForecastParameter]
          const mergedDetails = { ...details, ...includeDetails }

          if (!includeSeriesA || (!includeSeriesB && includeDetails.chart.areaSecondParameter)) continue

          // TODO: weather chart and axisPointer are too tighlty coupled via createdSeriesDetails
          if (includeDetails.showInTooltip) {
            createdSeriesDetails.push({
              parameter: includeParameter,
              details: mergedDetails,
              scale: scaleY,
              data: includeSeriesA,
            })
          }
          addDataRepresentation(includeParameter, includeSeriesA, mergedDetails, true, includeSeriesB)
        }
      }
    }

    // add a transparent rect to darken passed time
    svg
      .append('rect')
      .attr('x', dimensions.margin.left)
      .attr('y', dimensions.margin.top)
      .attr('width', Math.min(dimensions.width + dimensions.margin.left, scaleX($NOW_MILLIS)) - dimensions.margin.left)
      .attr('height', dimensions.height)
      .classed('fill-background', true)
      .attr('opacity', 0.6)

    const { updateXAxisPointer, hideXAxisPointer } = createAxisPointer({
      svg,
      dimensions,
      scaleX,
      seriesList: createdSeriesDetails,
      tooltip: $settingsChart.indicator !== 'display',
      startTimestamp,
      endTimestamp,
      isDaily: rollup,
    })

    function selectDatetime(timestamp: number | null) {
      // NOTE: using NOW > start to hide the axis pointer when starting at now
      const isToday = $NOW_MILLIS > startTimestamp && $NOW_MILLIS <= endTimestamp
      const isUserCaused = timestamp !== null

      // hide the pointer for other days by default
      if (!isToday && !isUserCaused) {
        hideXAxisPointer()
        highlightedTimeBucket = undefined
        return
      }

      const points = updateXAxisPointer(timestamp ?? $NOW_MILLIS, isUserCaused)
      if (!points) return

      highlightedTimeBucket = Object.fromEntries(points.map((p) => [p.parameter, p.datum])) as Record<
        ForecastParameter,
        TimeSeriesNumberEntry
      >
    }

    // auto-set by default
    selectDatetime(null)

    handleInteraction({
      svg,
      onLongPress: (e) => {
        const [px] = d3.pointer(e)
        const datetime = scaleX.invert(px).getTime()
        selectDatetime(datetime)
      },
      onScrollX: (e) => {
        const [px] = d3.pointer(e)
        const datetime = scaleX.invert(px).getTime()
        selectDatetime(datetime)
      },
      onSwipeX: (_) => {},
      onRelease: (_) => {
        selectDatetime(null)
      },
    })

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
    if (multiseries && parameters) updateChart()
  })
</script>

{#if parameterSelect}
  <ParameterSelect bind:visible={parameters} {multiseries} />
{/if}

{#if $settingsChart.indicator !== 'tooltip'}
  <ChartValuesDisplay {parameters} {highlightedTimeBucket} />
{/if}

<button bind:this={container} class={['relative w-full shrink-0 touch-pan-y snap-center', className]} {onclick}>
  <Skeleton class="h-full w-full" />
</button>
