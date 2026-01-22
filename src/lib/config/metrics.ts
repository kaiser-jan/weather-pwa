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
import type { ColorStop, MetricDetails } from '$lib/types/ui'
import { DEW_POINT_CATEGORIES, EAQI, RAIN_CATEGORIES, TEMPERATURE_CATEGORIES } from './categorization'

export const HIDE_AXIS_FOR_PARAMETERS: ForecastParameter[] = ['cloud_coverage', 'relative_humidity']
export const PREFER_MERGED_AXIS_FOR_PARAMETERS: ForecastParameter[] = ['dew_point']

function createLimitsGradient(limits: number[], colors: Omit<ColorStop, 'value'>[], factor = 1) {
  return limits.map(
    (l, i): ColorStop => ({
      ...colors[i],
      threshold: l * factor,
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
    color: { type: 'gradient', categories: TEMPERATURE_CATEGORIES },
    chart: {
      style: 'line',
      class: 'opacity-100',
      markExtrema: true,
      // TODO: make unit agnostic
      markers: [{ value: 0, class: 'stroke-1 stroke-white opacity-50' }],
      include: {
        temperature_max: {
          color: { type: 'gradient', categories: TEMPERATURE_CATEGORIES },
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
    // color: { css: 'var(--color-blue-300)' },
    color: {
      type: 'segments',
      categories: RAIN_CATEGORIES,
    },
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
    domain: { min: [0], max: [30] },
    domainDefault: { min: 8, max: 24 },
    icon: DropletsIcon,
    color: {
      type: 'gradient',
      categories: DEW_POINT_CATEGORIES,
    },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
    summary: { useTotalAsDomain: true },
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
      max: [0, 5],
    },
    color: {
      type: 'segments',
      categories: createLimitsGradient([0, 1, 2, 3, 4, 5], EAQI.colors),
    },
    chart: { style: 'line', class: 'opacity-80' },
    summary: { items: ['icon', 'avg', 'max'] },
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
    color: {
      type: 'segments',
      categories: createLimitsGradient(EAQI.limits.pm25, EAQI.colors, 1e-6),
    },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'avg', 'max'] },
  },
  pm10: {
    label: 'PM 10',
    abbreviation: 'PM10',
    domain: {
      min: [0],
      max: [EAQI.limits.pm10[3] * 1e-6, EAQI.limits.pm10[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.pm10),
    color: {
      type: 'segments',
      categories: createLimitsGradient(EAQI.limits.pm10, EAQI.colors, 1e-6),
    },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'avg', 'max'] },
  },
  o3: {
    label: 'Ozone',
    abbreviation: 'O3',
    domain: {
      min: [0],
      max: [EAQI.limits.o3[3] * 1e-6, EAQI.limits.o3[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.o3),
    color: {
      type: 'segments',
      categories: createLimitsGradient(EAQI.limits.o3, EAQI.colors, 1e-6),
    },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'avg', 'max'] },
  },
  no2: {
    label: 'Nitrogen Dioxide',
    abbreviation: 'NO2',
    domain: {
      min: [0],
      max: [EAQI.limits.no2[3] * 1e-6, EAQI.limits.no2[5] * 1e-6],
    },
    domainCallback: createAirPollutantDomainCallback(EAQI.limits.no2),
    color: {
      type: 'segments',
      categories: createLimitsGradient(EAQI.limits.no2, EAQI.colors, 1e-6),
    },
    chart: { style: 'line', class: 'opacity-50 stroke-3' },
    summary: { items: ['icon', 'avg', 'max'] },
  },

  // TODO: make this use ForecastMetrics instead
} as const satisfies Partial<Record<ForecastParameter, MetricDetails>>

export type ForecastMetric = keyof typeof _METRIC_DETAILS

// HACK: get the keys out but still type the entries as MetricDetails
export const METRIC_DETAILS = _METRIC_DETAILS as Record<ForecastMetric, MetricDetails>

export const FORECAST_METRICS = Object.keys(METRIC_DETAILS) as ForecastMetric[]
