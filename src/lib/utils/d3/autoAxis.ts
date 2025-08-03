import { HIDE_AXIS_FOR_PARAMETERS, type ForecastMetric } from '$lib/config/metrics'
import type { Unit } from '$lib/config/units'
import type { TimeSeries } from '$lib/types/data'
import type { MetricDetails } from '$lib/types/ui'
import { get } from 'svelte/store'
import { autoFormatMetric, getPreferredUnit } from '../units'
import { settings } from '$lib/settings/store'
import type { Dimensions } from './types'
import { createYAxis } from './axis'
import * as d3 from 'd3'
import { deepEqual } from '$lib/utils'

type CreateOptions = {
  dimensions: Dimensions
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

export function useAutoAxis() {
  let sideOffsets = { left: 0, right: 0 }
  let axisIndex = 0
  let existingAxisList: ComputedAxis[] = []

  function compute({ dimensions, parameter, series, details }: CreateOptions): ComputedAxis {
    const extent = d3.extent(series, (d) => d.value)
    const min = extent[0] ?? 0
    const max = extent[1] ?? 0
    const domain = [
      details.domain.min.findLast((t) => t <= min * 0.9) ?? details.domain.min[0],
      details.domain.max.find((t) => t >= max * 1.1) ?? details.domain.max[0],
    ] as const

    const unit = getPreferredUnit(parameter, get(settings))
    const format = (d: number) =>
      autoFormatMetric(d, parameter, get(settings), {
        hideUnit: get(settings).sections.components.chart.axisUnits !== 'inline',
      })

    const rangeY = [dimensions.height + dimensions.margin.top, dimensions.margin.top]
    const scaleY = d3.scaleLinear(domain, rangeY) //.nice()

    if (HIDE_AXIS_FOR_PARAMETERS.includes(parameter)) return { domain, unit, scaleY, format, axis: null }

    const newAxisBase = { domain, unit }
    const existingSameAxis = existingAxisList.find(
      (a) =>
        a.unit === newAxisBase.unit && a.domain[0] === newAxisBase.domain[0] && a.domain[1] === newAxisBase.domain[1],
    )
    console.log('existingSameAxis', existingSameAxis, existingAxisList, newAxisBase)
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
    sideOffsets[side] -= requiredX

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

    existingAxisList.push(newAxis)

    return newAxis
  }

  return {
    compute,
  }
}

function estimateTextWidth(text: string, font: string = '10px sans-serif'): number {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 0
  context.font = font
  return context.measureText(text).width
}
