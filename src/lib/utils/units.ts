import { settings } from '$lib/settings/store'
import type { WeatherMetricKey } from '$lib/types/data'
import * as d3 from 'd3'
import { get } from 'svelte/store'

export type UnitDimension =
  | 'temperature'
  | 'pressure'
  | 'length'
  | 'speed'
  | 'angle'
  | 'percentage'
  | 'energy'
  | 'radiation'
  | 'precipitation'

const METRIC_DIMENSION: Record<WeatherMetricKey, UnitDimension | null> = {
  temperature: 'temperature',
  temperature_min: 'temperature',
  temperature_max: 'temperature',
  temperature_feel: 'temperature',
  pressure: 'pressure',
  relative_humidity: 'percentage',
  uvi_clear_sky: null,
  cloud_coverage: 'percentage',
  fog: 'percentage',
  visibility: 'length',
  wind_speed: 'speed',
  wind_speed_gust: 'speed',
  wind_degrees: 'angle',
  wind_degrees_gust: 'angle',
  precipitation_amount: 'precipitation',
  precipitation_probability: 'percentage',
  thunder_probability: 'percentage',
  snow_amount: 'precipitation',
  cape: 'energy',
  cin: 'energy',
  grad: 'radiation',
} as const

export const UNIT_OPTIONS = {
  temperature: ['°C', '°F'],
  pressure: ['Pa', 'hPa', 'bar', 'inHg'],
  length: ['m', 'km', 'mi', 'mm', 'in'],
  speed: ['m/s', 'km/h', 'mph'],
  angle: ['°'],
  percentage: ['%', 'fraction'],
  energy: ['J/kg', 'm2/s2'],
  radiation: ['Ws/m2', 'J/m2', 'Wh/m2', 'kWh/m2'],
  precipitation: ['mm/h'],
} as const

export type Unit = (typeof UNIT_OPTIONS)[keyof typeof UNIT_OPTIONS][number]

const CONVERTERS: Record<UnitDimension, Partial<Record<Unit, (v: number) => number>>> = {
  temperature: {
    '°C': (v) => v,
    '°F': (v) => (v * 9) / 5 + 32,
  },
  pressure: {
    Pa: (v) => v,
    hPa: (v) => v / 1_00,
    bar: (v) => v / 100_000,
    inHg: (v) => v * 0.0002953,
  },
  length: {
    m: (v) => v,
    km: (v) => v / 1000,
    mi: (v) => v / 1609.34,
    mm: (v) => v,
    in: (v) => v / 25.4,
  },
  speed: {
    'm/s': (v) => v,
    'km/h': (v) => v * 3.6,
    mph: (v) => v * 2.23694,
  },
  angle: {
    '°': (v) => v,
  },
  percentage: {
    '%': (v) => v,
    fraction: (v) => v / 100,
  },
  energy: {
    'J/kg': (v) => v,
    'm2/s2': (v) => v,
  },
  radiation: {
    'Ws/m2': (v) => v,
    'J/m2': (v) => v,
    'Wh/m2': (v) => v / 3600,
    'kWh/m2': (v) => v / 3_600_000,
  },
  precipitation: {
    'mm/h': (v) => v,
  },
} as const

export function convertToUnit(value: number, key: WeatherMetricKey, unit: string): number {
  const dimension = METRIC_DIMENSION[key]
  if (!dimension) return value
  const converter = CONVERTERS[dimension]?.[unit as Unit] ?? ((v) => v)
  return converter(value)
}

export function formatMetric(value: number, key: WeatherMetricKey, unit: string, excludeUnit = false): string {
  const converted = convertToUnit(value, key, unit)
  // const string = converted.toFixed(unit === '%' ? 0 : 1)
  const string = d3.format('.1~f')(converted)
  if (excludeUnit) return string
  return string + unit
}

export function getPreferredUnit(key: WeatherMetricKey) {
  const dimension = METRIC_DIMENSION[key]
  if (!dimension) return null
  // TODO:
  return get(settings).general.units[dimension]
}
