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
import { EAQI } from './categorization'

export const HIDE_AXIS_FOR_PARAMETERS: ForecastParameter[] = ['cloud_coverage', 'relative_humidity']

function createLimitsGradient(limits: number[], colors: Omit<ColorStop, 'value'>[]) {
  return limits.map(
    (l, i): ColorStop => ({
      value: l * 1e-6,
      ...colors[i],
    }),
  )
}

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
    color: { css: 'var(--color-blue-200)' },
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
    color: { css: 'var(--color-blue-300)' },
    chart: {
      style: 'bars',
      class: 'opacity-80',
    },
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
          style: 'line',
          class: 'opacity-50 [stroke-dasharray:4_8]',
          color: { css: 'var(--color-blue-100)' },
        },
      },
    },
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
  },

  pressure: {
    label: 'Pressure',
    domain: { min: [980 * 100], max: [1040 * 100] },
    icon: GaugeIcon,
    color: { css: 'var(--color-purple-300)' },
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
    color: { css: 'var(--color-yellow-300)' },
    chart: {
      style: 'line',
      class: 'opacity-80',
    },
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
  },

  pm25: {
    label: 'PM 2.5',
    abbreviation: 'PM2.5',
    domain: {
      min: [0],
      max: [EAQI.limits.pm25[3] * 1e-6, EAQI.limits.pm25[5] * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(EAQI.limits.pm25, EAQI.colors),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  pm10: {
    label: 'PM 10',
    abbreviation: 'PM10',
    domain: {
      min: [0],
      max: [EAQI.limits.pm10[3] * 1e-6, EAQI.limits.pm10[5] * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(EAQI.limits.pm10, EAQI.colors),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  o3: {
    label: 'Ozone',
    abbreviation: 'O3',
    domain: {
      min: [0],
      max: [EAQI.limits.o3[3] * 1e-6, EAQI.limits.o3[5] * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(EAQI.limits.o3, EAQI.colors),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  no2: {
    label: 'Nitrogen Dioxide',
    abbreviation: 'NO2',
    domain: {
      min: [0],
      max: [EAQI.limits.no2[3] * 1e-6, EAQI.limits.no2[5] * 1e-6],
    },
    color: {
      gradient: createLimitsGradient(EAQI.limits.no2, EAQI.colors),
    },
    chart: { style: 'line', class: 'opacity-80' },
  },
  // TODO: make this use ForecastMetrics instead
} as const satisfies Partial<Record<ForecastParameter, MetricDetails>>

export type ForecastMetric = keyof typeof _METRIC_DETAILS

// HACK: get the keys out but still type the entries as MetricDetails
export const METRIC_DETAILS = _METRIC_DETAILS as Partial<Record<ForecastParameter, MetricDetails>>

export const FORECAST_METRICS = Object.keys(METRIC_DETAILS) as ForecastMetric[]
