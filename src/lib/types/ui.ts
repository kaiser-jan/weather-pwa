import type { Icon, ThermometerIcon } from '@lucide/svelte'
import type { Coordinates, TimeSeries, ForecastParameter, MultivariateTimeSeries } from './data'

export type WithCss<T> = T & { css: string }

export interface ColorOklch {
  l: number
  c: number
  h: number
  a: number
}

export type Category = { threshold: number; color?: WithCss<ColorOklch>; description?: string }
type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type CategoryColor = WithRequired<Category, 'color'>

export type ColorDefinition =
  | { css: string } //
  | { type: 'gradient' | 'segments'; inherit?: string }

export interface MetricDetailsChart {
  style: 'line' | 'bars' | 'area'
  class: string
  areaSecondParameter?: ForecastParameter
  markExtrema?: boolean
  markers?: { value: number; class: string }[]
}

export interface MetricDetails {
  label: string
  domain: { min: number[]; max: number[] }
  domainDefault?: { min: number; max: number }
  domainCallback?: (multiseries: MultivariateTimeSeries) => readonly [number, number] | null
  icon?: typeof ThermometerIcon
  abbreviation?: string
  preferCategoryLabel?: boolean
  categories?: Category[]
  color: ColorDefinition
  iconIfZero?: typeof ThermometerIcon

  chart: MetricDetailsChart & {
    // ForecastMetric
    // can include the current metric to specify the order
    stacksWith?: string[]
    include?: Partial<
      Record<
        ForecastParameter,
        { chart: MetricDetailsChart; color?: ColorDefinition; icon?: typeof ThermometerIcon; showInTooltip?: boolean }
      >
    >
  }

  summary: {
    useTotalAsDomain?: boolean
    items?: ParameterDaySummaryProps['items']
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
  // TODO: refactor: consider removing or making this the default
  useTotalAsDomain?: boolean
  items?: ('min' | 'max' | 'avg' | 'sum' | 'range' | 'range-bar' | 'trend' | 'groups' | 'aggregated-groups')[]
}
export const ITEM_ID_GEOLOCATION = 'geolocation'
export const ITEM_ID_TEMPORARY = 'search'

export type Location = Coordinates & {
  id: string
  name: string
  icon: string
}
