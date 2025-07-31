import {
  CloudOffIcon,
  CloudyIcon,
  DropletIcon,
  FactoryIcon,
  GaugeIcon,
  ShieldIcon,
  SunIcon,
  ThermometerIcon,
  UmbrellaIcon,
  UmbrellaOffIcon,
  WindIcon,
  ZapIcon,
} from '@lucide/svelte'
import type { ForecastParameter } from '$lib/types/data'
import type { ColorStop, MetricDetails } from '$lib/types/ui'

export const HIDE_AXIS_FOR_PARAMETERS: ForecastParameter[] = ['cloud_coverage', 'relative_humidity']

const green = { h: 110, s: 60, l: 60 }
const yellow = { h: 60, s: 70, l: 70 }
const orange = { h: 30, s: 75, l: 80 }
const red = { h: 5, s: 70, l: 75 }
const darkred = { h: 0, s: 90, l: 30 }

function createLimitsGradient([a, b, c, d]: {
  value: number
  comment: string
}[]): ColorStop[] {
  return [
    { value: 0, ...green },
    { value: a.value, ...yellow },
    { value: b.value, ...orange },
    { value: c.value, ...red },
    { value: d.value, ...darkred },
  ]
}

// https://eur-lex.europa.eu/eli/dir/2024/2881/oj/eng#anx_I
const pm25Limits = [
  { value: 5 * 1e-6, comment: 'WHO annual' },
  { value: 10 * 1e-6, comment: 'EU limit yearly' },
  { value: 25 * 1e-6, comment: 'EU limit daily, max 18 days' },
  { value: 50 * 1e-6, comment: '' },
]

const pm10Limits = [
  { value: 15 * 1e-6, comment: 'WHO guideline' },
  { value: 20 * 1e-6, comment: 'EU limit yearly' },
  { value: 45 * 1e-6, comment: 'EU limit daily, max 18 days' },
  { value: 100 * 1e-6, comment: '' },
]

const o3Limits = [
  { value: 100 * 1e-6, comment: 'WHO daily 8‑hour, EU long-term objective 2050' },
  { value: 120 * 1e-6, comment: 'EU target, max 8-hour mean within a year' },
  { value: 160 * 1e-6, comment: '' },
  { value: 200 * 1e-6, comment: '' },
]

const no2Limits = [
  { value: 10 * 1e-6, comment: 'WHO annual' },
  { value: 20 * 1e-6, comment: 'EU limit yearly' },
  { value: 50 * 1e-6, comment: 'EU limit daily' },
  { value: 200 * 1e-6, comment: 'EU limit hourly' },
]

const _METRIC_DETAILS = {
  temperature: {
    label: 'Temperature',
    domain: { min: [-40, -20, 0], max: [20, 40, 60] },
    icon: ThermometerIcon,
    color: { gradientSetting: ['appearance', 'colors', 'temperatureColorStops'] },
    chart: {
      style: 'line',
      class: '',
      markExtrema: true,

      include: {
        temperature_max: {
          style: 'area',
          class: 'opacity-40',
          color: { gradientSetting: ['appearance', 'colors', 'temperatureColorStops'] },
          areaSecondParameter: 'temperature_min',
        },
      },
    },
  },

  cloud_coverage: {
    label: 'Cloud Coverage',
    domain: { min: [0], max: [100] },
    icon: CloudyIcon,
    iconIfZero: CloudOffIcon,
    color: { tailwind: { bg: 'bg-blue-200', fill: 'fill-blue-200', stroke: 'stroke-blue-200' } },
    chart: {
      style: 'bars',
      class: 'opacity-15',
    },
  },

  precipitation_amount: {
    label: 'Precipitation Amount',
    domain: { min: [0], max: [20, 50] },
    icon: UmbrellaIcon,
    iconIfZero: UmbrellaOffIcon,
    color: { tailwind: { bg: 'bg-blue-300', fill: 'fill-blue-300', stroke: 'stroke-blue-300' } },
    chart: {
      style: 'bars',
      class: 'opacity-80',
    },
  },

  wind_speed: {
    label: 'Wind',
    domain: { min: [0], max: [61 / 3.6, 118 / 3.6] },
    icon: WindIcon,
    color: { tailwind: { bg: 'bg-blue-100', fill: 'fill-blue-100', stroke: 'stroke-blue-100' } },
    chart: {
      style: 'line',
      class: 'opacity-80',
      include: {
        wind_speed_gust: {
          style: 'line',
          class: 'opacity-50 [stroke-dasharray:4_8]',
          color: { tailwind: { bg: 'bg-blue-100', fill: 'fill-blue-100', stroke: 'stroke-blue-100' } },
        },
      },
    },
  },

  relative_humidity: {
    label: 'Relative Humidity',
    domain: { min: [0], max: [100] },
    icon: DropletIcon,
    color: { tailwind: { bg: 'bg-green-300', fill: 'fill-green-300', stroke: 'stroke-green-300' } },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
  },

  pressure: {
    label: 'Pressure',
    domain: { min: [980 * 100], max: [1040 * 100] },
    icon: GaugeIcon,
    color: { tailwind: { bg: 'bg-purple-300', fill: 'fill-purple-300', stroke: 'stroke-purple-300' } },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
  },

  // uvi_clear_sky: {
  //   domain: [0, 12],
  //   style: 'line',
  //   icon: SoapDispenserDropletIcon,
  //   class: 'stroke-orange-300 opacity-80',
  //   formatter: (d) => d.toString(),
  //   scaleOnRight: false,
  // },

  cape: {
    label: 'CAPE',
    domain: { min: [0], max: [1000] },
    icon: ZapIcon,
    color: { tailwind: { bg: 'bg-yellow-300', fill: 'fill-yellow-300', stroke: 'stroke-yellow-300' } },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
  },

  cin: {
    label: 'CIN',
    domain: { min: [-500], max: [0] },
    icon: ShieldIcon,
    color: { tailwind: { bg: 'bg-orange-300', fill: 'fill-orange-300', stroke: 'stroke-orange-300' } },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
  },

  grad: {
    label: 'Global Radiation',
    domain: { min: [-1000], max: [50_000_000] },
    icon: SunIcon,
    color: { tailwind: { bg: 'bg-yellow-300', fill: 'fill-yellow-300', stroke: 'stroke-yellow-300' } },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
  },

  pm2_5: {
    label: 'PM 2.5',
    abbreviation: 'PM2.5',
    domain: {
      min: [0],
      max: [10 * 1e-6, 50 * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(pm25Limits),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  pm10: {
    label: 'PM 10',
    abbreviation: 'PM10',
    domain: {
      min: [0],
      max: [20 * 1e-6, 100 * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(pm10Limits),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  o3: {
    label: 'Ozone',
    abbreviation: 'O3',
    domain: {
      min: [0],
      max: [120 * 1e-6, 240 * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(o3Limits),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  no2: {
    label: 'Nitrogen Dioxide',
    abbreviation: 'NO2',
    domain: {
      min: [0],
      max: [20 * 1e-6, 200 * 1e-6], // µg/m³: WHO annual limit, moderate, unhealthy
    },
    color: {
      gradient: createLimitsGradient(no2Limits),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  // TODO: make this use ForecastMetrics instead
} as const satisfies Partial<Record<ForecastParameter, MetricDetails>>

export type ForecastMetric = keyof typeof _METRIC_DETAILS

// HACK: get the keys out but still type the entries as MetricDetails
export const METRIC_DETAILS = _METRIC_DETAILS as Partial<Record<ForecastParameter, MetricDetails>>

export const FORECAST_METRICS = Object.keys(METRIC_DETAILS) as ForecastMetric[]
