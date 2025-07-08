import type { ThermometerIcon } from '@lucide/svelte'
import type { TimeSeries, WeatherMetricKey } from './data'

export type ColorStop = { value: number; h: number; s: number; l: number }

export interface SeriesDetailsBase {
  style: 'line' | 'bars' | 'area'
  class: string
  gradientColorStops?: ColorStop[]
  invert?: boolean
  areaSecondParameter?: WeatherMetricKey
}

export interface SeriesDetails extends SeriesDetailsBase {
  label: string
  domain: [number, number]
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
