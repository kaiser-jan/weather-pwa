import type { Icon, ThermometerIcon } from '@lucide/svelte'
import type { Coordinates, TimeSeries, ForecastParameter, MultivariateTimeSeries } from './data'

export type ColorStop = { value: number; h: number; s: number; l: number; a?: number }

export type ColorDefinition =
  | { css: string } //
  | { gradient: ColorStop[] }
  | { segments: ColorStop[] }
  | { gradientSetting: string[] }

export interface MetricDetailsChart {
  style: 'line' | 'bars' | 'area'
  class: string
  areaSecondParameter?: ForecastParameter
  markExtrema?: boolean
}

export interface MetricDetails {
  label: string
  domain: { min: number[]; max: number[] }
  domainDefault?: { min: number; max: number }
  domainCallback?: (multiseries: MultivariateTimeSeries) => readonly [number, number] | null
  icon?: typeof ThermometerIcon
  abbreviation?: string
  color: ColorDefinition
  iconIfZero?: typeof ThermometerIcon

  chart: MetricDetailsChart & {
    include?: Partial<
      Record<
        ForecastParameter,
        { chart: MetricDetailsChart; color?: ColorDefinition; icon?: typeof ThermometerIcon; showInTooltip?: boolean }
      >
    >
  }
}

export interface CreatedSeriesDetails {
  parameter: string
  details: MetricDetails
  data: TimeSeries<number>
  scale: d3.ScaleLinear<number, number, never>
}

export interface ParameterDaySummaryProps {
  icon?: typeof Icon
  useTotalAsDomain?: boolean
  items?: ('icon' | 'min' | 'max' | 'avg' | 'sum' | 'range-bar' | 'trend' | 'precipitation-groups')[]
}
export const ITEM_ID_GEOLOCATION = 'geolocation'
export const ITEM_ID_TEMPORARY = 'search'

export type Location = Coordinates & {
  id: string
  name: string
  icon: string
}
