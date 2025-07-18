import type { Icon, ThermometerIcon } from '@lucide/svelte'
import type { Coordinates, TimeBucket, TimeSeries, WeatherMetricKey } from './data'

export type ColorStop = { value: number; h: number; s: number; l: number }

export interface SeriesDetailsBase {
  style: 'line' | 'bars' | 'area'
  class: string
  color?:
    | // HACK: this is ugly but allows tailwind to detect the class names
    { tailwind: { bg: string; fill: string; stroke: string } } //
    | { gradient: ColorStop[] }
    | { gradientSetting: string[] }
  invert?: boolean
  areaSecondParameter?: WeatherMetricKey
  markExtrema?: boolean
}

export interface SeriesDetails extends SeriesDetailsBase {
  label: string
  domain: { min: number[]; max: number[] }
  icon: typeof ThermometerIcon
  iconIfZero?: typeof ThermometerIcon
  unit: string
  hideScale?: boolean
  scaleOnRight?: boolean
  include?: Partial<Record<WeatherMetricKey, SeriesDetailsBase>>
}

export interface CreatedSeriesDetails extends SeriesDetails {
  name: string
  scale: d3.ScaleLinear<number, number, never>
  data: TimeSeries<number>
}

export type LocationSelection =
  | {
      index: number
    }
  | {
      coordinates: Coordinates
    }

export interface ParameterDaySummaryProps {
  icon?: typeof Icon
  useTotalAsDomain?: boolean
  items?: ('icon' | 'min' | 'max' | 'avg' | 'sum' | 'range-bar' | 'trend')[]
  widthFraction: number
}
