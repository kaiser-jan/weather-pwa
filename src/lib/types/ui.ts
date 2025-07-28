import type { Icon, ThermometerIcon } from '@lucide/svelte'
import type { Coordinates, TimeSeries, ForecastParameter } from './data'

export type ColorStop = { value: number; h: number; s: number; l: number }

// HACK: this is ugly but allows tailwind to detect the class names
type ColorDefinition =
  | { tailwind: { bg: string; fill: string; stroke: string } } //
  | { gradient: ColorStop[] }
  | { gradientSetting: string[] }

export interface SeriesDetailsBase {
  style: 'line' | 'bars' | 'area'
  class: string
  color?: ColorDefinition
  areaSecondParameter?: ForecastParameter
  markExtrema?: boolean
}

export interface SeriesDetails extends SeriesDetailsBase {
  label: string
  domain: { min: number[]; max: number[] }
  icon: typeof ThermometerIcon
  iconIfZero?: typeof ThermometerIcon
  include?: Partial<Record<ForecastParameter, SeriesDetailsBase>>
}

export interface CreatedSeriesDetails extends SeriesDetails {
  name: string
  scale: d3.ScaleLinear<number, number, never>
  data: TimeSeries<number>
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
