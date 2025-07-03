import type { ThermometerIcon } from 'lucide-svelte'
import type { TimeSeries } from './data'

export type ColorStop = { value: number; h: number; s: number; l: number }

export interface SeriesDetails {
  domain: [number, number]
  style: 'line' | 'bars'
  icon: typeof ThermometerIcon
  iconIfZero?: typeof ThermometerIcon
  class: string
  unit: string
  hideScale?: boolean
  scaleOnRight?: boolean
  gradientColorStops?: ColorStop[]
  invert?: boolean
}

export interface CreatedSeriesDetails extends SeriesDetails {
  name: string
  scale: d3.ScaleLinear<number, number, never>
  data: TimeSeries<number>
}
