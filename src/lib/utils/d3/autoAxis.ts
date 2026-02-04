import { HIDE_AXIS_FOR_PARAMETERS, PREFER_MERGED_AXIS_FOR_PARAMETERS, type ForecastMetric } from '$lib/config/metrics'
import type { Unit } from '$lib/config/units'
import type { MultivariateTimeSeries, TimeSeries } from '$lib/types/data'
import type { MetricDetails } from '$lib/types/ui'
import { get } from 'svelte/store'
import { autoFormatMetric, getPreferredUnit } from '../units'
import { settings } from '$lib/stores/settings'
import type { Dimensions } from './types'
import * as d3 from 'd3'

type AxisDetails = {
  parameter: ForecastMetric
  series: TimeSeries<number>
  details: MetricDetails
}

type ComputedAxis = {
  domain: readonly [number, number]
  unit: Unit | null
  scaleY: d3.ScaleLinear<number, number, never>
  format: (d: number) => string
  axis: {
    side: 'left' | 'right'
    offset: number
  } | null
}

export function computeAxesFor(
  axes: AxisDetails[],
  dimensions: Dimensions,
  multiseries: MultivariateTimeSeries,
  hideAxes?: boolean,
) {
  let sideOffsets = { left: 0, right: 0 }
  let axisIndex = 0
  // @ts-expect-error
  let existingAxes: Record<ForecastMetric, ComputedAxis> = {}

  const delayedAxes: AxisDetails[] = []
  for (const axis of axes) {
    // some parameters have the same units and it makes sense to use existing axis, even the domain might not be perfect
    if (PREFER_MERGED_AXIS_FOR_PARAMETERS.includes(axis.parameter)) {
      delayedAxes.push(axis)
      continue
    }

    existingAxes[axis.parameter] = compute(axis)
  }

  // for all axis which prefer using an existing axis, check if there is one that fits or create one otherwise
  for (const axis of delayedAxes) {
    const extent = d3.extent(axis.series, (d) => d.value)
    const min = extent[0] ?? 0
    const max = extent[1] ?? 0
    const unit = getPreferredUnit(axis.parameter, get(settings))
    const matchingAxis = Object.values(existingAxes).find(
      (a) => a.unit === unit && a.domain[0] < min && a.domain[1] > max,
    )
    // if there already is a matching axis, use the same details but don't redraw the axis
    existingAxes[axis.parameter] = matchingAxis ? { ...matchingAxis, axis: null } : compute(axis)
  }

  return existingAxes

  function compute({ parameter, series, details }: AxisDetails): ComputedAxis {
    const extent = d3.extent(series, (d) => d.value)
    // TODO: consider using the original data for the axes
    const rollupMin = d3.min(series, (d) => d.min)
    const rollupMax = d3.max(series, (d) => d.max)

    const min = rollupMin ?? extent[0] ?? 0
    const max = rollupMax ?? extent[1] ?? 0
    const safeArea = (max - min) * 0.1
    const domain =
      details.domainCallback?.(multiseries) ??
      ([
        details.domain.min.findLast((t) => t <= min - safeArea) ?? details.domain.min[0],
        details.domain.max.find((t) => t >= max + safeArea) ?? details.domain.max[details.domain.max.length - 1],
      ] as const)

    const unit = getPreferredUnit(parameter, get(settings))
    const format = (d: number) =>
      autoFormatMetric(d, parameter, get(settings), {
        hideUnit: get(settings).sections.components.chart.axisUnits !== 'inline',
      })

    const rangeY = [dimensions.height + dimensions.margin.top, dimensions.margin.top]
    const scaleY = d3.scaleLinear(domain, rangeY) //.nice()

    const shouldHide = HIDE_AXIS_FOR_PARAMETERS.includes(parameter)
    const hasNoValue = !series.length || series.every((e) => e.value === 0)
    if (shouldHide || hasNoValue || hideAxes) return { domain, unit, scaleY, format, axis: null }

    const newAxisBase = { domain, unit }
    const existingSameAxis = Object.values(existingAxes).find(
      (a) =>
        a.unit === newAxisBase.unit && a.domain[0] === newAxisBase.domain[0] && a.domain[1] === newAxisBase.domain[1],
    )
    if (existingSameAxis) return existingSameAxis

    const minString = format(details.domain.min[0])
    const maxString = format(details.domain.max[details.domain.max.length - 1])
    const textWidthMinValue = estimateTextWidth(minString)
    const textWidthUnit = estimateTextWidth(unit ?? '')
    const textWidthMaxValue = estimateTextWidth(maxString)
    const requiredX = Math.max(textWidthMinValue, textWidthUnit, textWidthMaxValue) + 10
    console.debug(minString, maxString, unit)

    let offset
    const axisOnLeft = axisIndex % 2 === 0
    const side = axisOnLeft ? 'left' : 'right'
    dimensions.margin[side] += requiredX
    offset = sideOffsets[side]
    sideOffsets[side] += requiredX
    console.log(`adding ${requiredX} offset ${side}`)

    axisIndex += 1

    const newAxis = {
      domain,
      unit,
      scaleY,
      format,
      axis: {
        side,
        offset,
      },
    } as const

    existingAxes[parameter] = newAxis

    return newAxis
  }
}

function estimateTextWidth(text: string, font: string = '10px sans-serif'): number {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 0
  context.font = font
  return context.measureText(text).width
}
