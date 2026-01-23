import {
  CloudOffIcon,
  CloudyIcon,
  DropletIcon,
  DropletsIcon,
  FactoryIcon,
  GaugeIcon,
  ShieldIcon,
  SunIcon,
  ThermometerIcon,
  TornadoIcon,
  UmbrellaIcon,
  UmbrellaOffIcon,
  WindIcon,
  ZapIcon,
} from '@lucide/svelte'
import type { ForecastParameter, MultivariateTimeSeries } from '$lib/types/data'
import type { ColorOklch, Category, MetricDetails, WithCss } from '$lib/types/ui'
import { EAQI } from './categorization'
import { parseOklch } from '$lib/utils/color'

export const HIDE_AXIS_FOR_PARAMETERS: ForecastParameter[] = ['cloud_coverage', 'relative_humidity']
export const PREFER_MERGED_AXIS_FOR_PARAMETERS: ForecastParameter[] = ['dew_point']

function createLimitsCategories(limits: number[], colors: WithCss<ColorOklch>[], labels: string[], factor = 1) {
  return limits.map(
    (l, i): Category => ({
      color: colors[i],
      threshold: l * factor,
      description: labels[i],
    }),
  )
}

function createAirPollutantDomainCallback(limits: number[]) {
  return (multiseries: MultivariateTimeSeries) => {
    if (!multiseries.aqi) return null
    const index = Math.ceil(Math.max(...multiseries.aqi.map((d) => d.value)))
    return [0, limits[index] * 1e-6] as const
  }
}

const _METRIC_DETAILS = {
  temperature: {
    label: 'Temperature',
    domain: { min: [-40, -20, -10, 0], max: [10, 20, 30, 40, 60] },
    domainDefault: { min: 10, max: 35 },
    icon: ThermometerIcon,
    categories: [
      { threshold: -80, color: parseOklch('oklch(44% 0.15 26)') },
      { threshold: -20, color: parseOklch('oklch(38% 0.17 295)') },
      { threshold: -10, color: parseOklch('oklch(43% 0.16 266)') },
      { threshold: -5, color: parseOklch('oklch(70% 0.14 258)') },
      { threshold: 0, color: parseOklch('oklch(100% 0.00 220)') },
      { threshold: 5, color: parseOklch('oklch(80% 0.10 225)') },
      { threshold: 10, color: parseOklch('oklch(80% 0.09 187)') },
      { threshold: 15, color: parseOklch('oklch(82% 0.11 151)') },
      { threshold: 20, color: parseOklch('oklch(82% 0.19 135)') },
      { threshold: 25, color: parseOklch('oklch(86% 0.14 94)') },
      { threshold: 30, color: parseOklch('oklch(70% 0.12 55)') },
      { threshold: 40, color: parseOklch('oklch(46% 0.13 35)') },
    ],
    color: { type: 'gradient' },
    chart: {
      style: 'line',
      class: 'opacity-100',
      markExtrema: true,
      // TODO: make unit agnostic
      markers: [{ value: 0, class: 'stroke-1 stroke-white opacity-50' }],
      include: {
        temperature_max: {
          color: { type: 'gradient', inherit: 'temperature' },
          chart: {
            style: 'area',
            class: 'opacity-40',
            areaSecondParameter: 'temperature_min',
          },
        },
      },
    },
    summary: { useTotalAsDomain: true },
  },

  cloud_coverage: {
    label: 'Cloud Coverage',
    domain: { min: [0], max: [100] },
    icon: CloudyIcon,
    iconIfZero: CloudOffIcon,
    preferCategoryLabel: true,
    categories: [
      { threshold: 0, description: 'Clear' },
      { threshold: 12.5, description: 'Few' },
      { threshold: 37.5, description: 'Scattered' },
      { threshold: 62.5, description: 'Broken' },
      { threshold: 87.5, description: 'Overcast' },
    ],
    color: { css: 'var(--color-blue-200)' },
    chart: {
      style: 'area',
      class: 'opacity-20',
    },
    summary: { items: ['icon', 'avg'] },
  },

  precipitation_amount: {
    label: 'Precipitation Amount',
    domain: { min: [0], max: [7.2, 20, 50] },
    domainDefault: { min: 0, max: 7.2 },
    icon: UmbrellaIcon,
    iconIfZero: UmbrellaOffIcon,
    // https://en.wikipedia.org/wiki/Precipitation_types#Intensity
    categories: [
      { threshold: 0, color: parseOklch('oklch(68% 0.09 249 / 40%)'), description: 'Drizzle' },
      { threshold: 0.2, color: parseOklch('oklch(63% 0.11 257 / 70%)'), description: 'Light' },
      { threshold: 2.5, color: parseOklch('oklch(53% 0.15 267 / 90%)'), description: 'Moderate' },
      { threshold: 7.2, color: parseOklch('oklch(40% 0.18 278 / 100%)'), description: 'Heavy' },
      { threshold: 25, color: parseOklch('oklch(39% 0.16 297 / 100%)'), description: 'Extreme' },
      { threshold: 50, color: parseOklch('oklch(51% 0.23 311 / 100%)'), description: 'Violent' },
    ],
    color: { type: 'segments' },
    chart: {
      style: 'bars',
      class: 'opacity-80',
    },
    summary: { items: ['icon', 'precipitation-groups'] },
  },

  wind_speed: {
    label: 'Wind',
    domain: { min: [0], max: [61 / 3.6, 118 / 3.6] },
    icon: WindIcon,
    color: { css: 'var(--color-blue-100)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
      include: {
        wind_speed_gust: {
          icon: TornadoIcon,
          showInTooltip: true,
          color: { css: 'var(--color-blue-100)' },
          chart: {
            style: 'line',
            class: 'opacity-50 [stroke-dasharray:4_8]',
          },
        },
      },
    },
    summary: { items: ['icon', 'avg', 'max'] },
  },

  relative_humidity: {
    label: 'Relative Humidity',
    domain: { min: [0], max: [100] },
    icon: DropletIcon,
    color: { css: 'var(--color-green-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: {},
  },

  dew_point: {
    label: 'Dew Point',
    domain: { min: [-10, 0], max: [0, 10, 20, 30] },
    domainDefault: { min: 8, max: 24 },
    icon: DropletsIcon,
    preferCategoryLabel: true,
    // https://www.researchgate.net/figure/Dew-point-Humidity-and-corresponding-Human-Perception_tbl5_312498146
    categories: [
      { threshold: -20, color: parseOklch('oklch(46% 0.16 296)'), description: 'Very Dry' },
      { threshold: -10, color: parseOklch('oklch(47% 0.17 277)'), description: 'Very Dry' },
      { threshold: 0, color: parseOklch('oklch(61% 0.12 252)'), description: 'Dry' },
      { threshold: 6, color: parseOklch('oklch(75% 0.08 225)'), description: 'Dry' },
      { threshold: 10, color: parseOklch('oklch(80% 0.18 136)'), description: 'Great' },
      { threshold: 12, color: parseOklch('oklch(88% 0.16 125)'), description: 'Fair' },
      { threshold: 16, color: parseOklch('oklch(89% 0.15 104)'), description: 'Ok' },
      { threshold: 18, color: parseOklch('oklch(78% 0.13 73)'), description: 'Humid' },
      { threshold: 21, color: parseOklch('oklch(76% 0.12 47)'), description: 'Very Humid' },
      { threshold: 24, color: parseOklch('oklch(70% 0.15 33)'), description: 'Extremely Humid' },
      { threshold: 26, color: parseOklch('oklch(61% 0.20 304)'), description: 'Dangerously Humid' },
    ],
    color: { type: 'gradient' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { items: ['avg', 'max'] },
  },

  pressure_surface: {
    label: 'Pressure (Surface)',
    // TODO: find a better way to select a domain here, as the value range depends on the altitude
    domain: { min: [980 * 100], max: [1040 * 100] },
    icon: GaugeIcon,
    color: { css: 'var(--color-purple-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { items: ['icon', 'avg', 'trend'] },
  },
  pressure_sealevel: {
    label: 'Pressure (Sea Level)',
    domain: { min: [980 * 100], max: [1040 * 100] },
    icon: GaugeIcon,
    color: { css: 'var(--color-purple-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { items: ['icon', 'avg', 'trend'] },
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
    color: { css: 'var(--color-yellow-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { items: ['icon', 'avg', 'max'] },
  },

  cin: {
    label: 'CIN',
    domain: { min: [-500], max: [0] },
    icon: ShieldIcon,
    color: { css: 'var(--color-orange-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { items: ['icon', 'max'] },
  },

  grad: {
    label: 'Global Radiation',
    domain: { min: [-1000], max: [50_000_000] },
    icon: SunIcon,
    color: { css: 'var(--color-yellow-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { items: ['icon', 'max'] },
  },

  aqi: {
    label: 'Air Quality',
    icon: FactoryIcon,
    domain: {
      min: [0],
      max: [5],
    },
    preferCategoryLabel: true,
    categories: createLimitsCategories([0, 1, 2, 3, 4, 5], EAQI.colors, EAQI.labels),
    color: { type: 'segments' },
    chart: { style: 'line', class: 'opacity-80' },
    summary: { items: ['icon', 'min', 'max'] },
  },
  // TODO: to be precise, air quality metrics would need a non-linear scale
  // the increments between the limits are not equal, resulting in a distorted chart
  pm25: {
    label: 'PM 2.5',
    abbreviation: 'PM2.5',
    domain: {
      min: [0],
      max: [EAQI.limits.pm25[3] * 1e-6, EAQI.limits.pm25[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.pm25),
    preferCategoryLabel: true,
    categories: createLimitsCategories(EAQI.limits.pm25, EAQI.colors, EAQI.labels, 1e-6),
    color: { type: 'segments' },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'min', 'max'] },
  },
  pm10: {
    label: 'PM 10',
    abbreviation: 'PM10',
    domain: {
      min: [0],
      max: [EAQI.limits.pm10[3] * 1e-6, EAQI.limits.pm10[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.pm10),
    preferCategoryLabel: true,
    categories: createLimitsCategories(EAQI.limits.pm10, EAQI.colors, EAQI.labels, 1e-6),
    color: { type: 'segments' },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'min', 'max'] },
  },
  o3: {
    label: 'Ozone',
    abbreviation: 'O3',
    domain: {
      min: [0],
      max: [EAQI.limits.o3[3] * 1e-6, EAQI.limits.o3[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.o3),
    preferCategoryLabel: true,
    categories: createLimitsCategories(EAQI.limits.o3, EAQI.colors, EAQI.labels, 1e-6),
    color: { type: 'segments' },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'min', 'max'] },
  },
  no2: {
    label: 'Nitrogen Dioxide',
    abbreviation: 'NO2',
    domain: {
      min: [0],
      max: [EAQI.limits.no2[3] * 1e-6, EAQI.limits.no2[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.no2),
    preferCategoryLabel: true,
    categories: createLimitsCategories(EAQI.limits.no2, EAQI.colors, EAQI.labels, 1e-6),
    color: { type: 'segments' },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'min', 'max'] },
  },

  // TODO: make this use ForecastMetrics instead
} as const satisfies Partial<Record<ForecastParameter, MetricDetails>>

export type ForecastMetric = keyof typeof _METRIC_DETAILS

// HACK: get the keys out but still type the entries as MetricDetails
export const METRIC_DETAILS = _METRIC_DETAILS as Record<ForecastMetric, MetricDetails>

export const FORECAST_METRICS = Object.keys(METRIC_DETAILS) as ForecastMetric[]

export function getMetricDetails(metric: ForecastMetric) {
  return METRIC_DETAILS[metric]
}

export function categorizeValue(metricDetails: MetricDetails, value: number) {
  if (!metricDetails.categories) return undefined
  return metricDetails.categories.findLast((c) => c.threshold < value)
}

export function useCategoriesForColor(metricDetails: MetricDetails) {
  return metricDetails.categories && 'type' in metricDetails.color
}
