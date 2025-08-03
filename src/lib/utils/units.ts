import { type SettingsSchema } from '$lib/settings/store'
import type { ForecastParameter } from '$lib/types/data'
import { CONVERTERS, DECIMAL_RECOMMENDED_FOR, METRIC_DIMENSION, type Unit } from '$lib/config/units'
import * as d3 from 'd3'

export function convertToUnit(value: number, key: ForecastParameter, unit: Unit | null): number {
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
  const showDecimal =
    options?.showDecimal !== undefined
      ? options.showDecimal
      : unit !== null
        ? DECIMAL_RECOMMENDED_FOR.includes(unit)
        : false

  const string = d3.format(showDecimal ? '.1f' : 'd')(value)
  // console.debug(value, unit, options, string)
  if (options?.hideUnit) return string
  return string + unit
}

export function autoFormatMetric(
  value: number | undefined | null,
  key: ForecastParameter,
  settings: SettingsSchema,
  options?: { hideUnit?: boolean; showDecimal?: boolean },
): string {
  if (value === undefined || value === null) return '-'
  const unit = getPreferredUnit(key, settings)
  const converted = convertToUnit(value, key, unit)
  return formatMetric(converted, unit, options)
}

// NOTE: passing in settings allows for deciding on reactivity
export function getPreferredUnit(key: ForecastParameter, settings: SettingsSchema) {
  const dimension = METRIC_DIMENSION[key]
  if (!dimension) return null
  return settings.general.units[dimension]
}
