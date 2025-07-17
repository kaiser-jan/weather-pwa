import { type SettingsSchema } from '$lib/settings/store'
import type { WeatherMetricKey } from '$lib/types/data'
import * as d3 from 'd3'

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
    mm: (v) => v * 1000,
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

// TODO: this breaks as soon as a unit is used for metrics in a different range: e.g. short vs long distances
//
// we could group units (mm, m, km) and have have values/a function to decide the unit for the value per group
// this would break when having multiple values to compare which cross this boundary
//
// we could still group units but then define which of these to select per metric
//
// maybe don't decide on a per-value basis but define a range per metric
// OR instance where the metric is used and auto-decide based on the range
const DECIMAL_RECOMMENDED_FOR: Unit[] = ['bar', 'inHg', 'km']

export function convertToUnit(value: number, key: WeatherMetricKey, unit: Unit | null): number {
  const dimension = METRIC_DIMENSION[key]
  if (!dimension || !unit) return value
  const converter = CONVERTERS[dimension]?.[unit] ?? ((v) => v)
  return converter(value)
}

export function formatMetric(
  value: number,
  unit: Unit | null,
  options?: { showDecimal?: boolean; hideUnit?: boolean },
): string {
  const showDecimal = options?.showDecimal !== undefined ? options.showDecimal : DECIMAL_RECOMMENDED_FOR.includes(unit)
  const string = d3.format(showDecimal ? '.1f' : 'd')(value)
  // console.debug(value, unit, options, string)
  if (options?.hideUnit) return string
  return string + unit
}

export function autoFormatMetric(
  value: number,
  key: WeatherMetricKey,
  settings: SettingsSchema,
  options?: { hideUnit?: boolean; showDecimal?: boolean },
): string {
  const unit = getPreferredUnit(key, settings)
  const converted = convertToUnit(value, key, unit)
  return formatMetric(converted, unit, options)
}

// NOTE: passing in settings allows for deciding on reactivity
export function getPreferredUnit(key: WeatherMetricKey, settings: SettingsSchema) {
  const dimension = METRIC_DIMENSION[key]
  if (!dimension) return null
  return settings.general.units[dimension]
}
