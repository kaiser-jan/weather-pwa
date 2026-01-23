import { type Settings } from '$lib/stores/settings'
import type { ForecastParameter } from '$lib/types/data'
import { CONVERTERS, DECIMAL_RECOMMENDED_FOR, METRIC_DIMENSION, type Unit } from '$lib/config/units'
import * as d3 from 'd3'

/**
 * Converts the given value from the internal unit to the target unit
 */
export function convertToUnit(value: number, key: ForecastParameter, unit: Unit | null): number {
  const dimension = METRIC_DIMENSION[key]
  if (!dimension || !unit) return value
  const converter = CONVERTERS[dimension]?.[unit] ?? ((v) => v)
  return converter(value)
}

/**
 * Formats the given value to a string with the given unit.
 * Does NOT perfor unit conversion.
 */
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
  if (options?.hideUnit || unit === null) return string
  return string + unit
}

/**
 * Formats the given value to a string with the unit according to the users preferences.
 */
export function autoFormatMetric(
  value: number | undefined | null,
  key: ForecastParameter,
  settings: Settings,
  options?: { hideUnit?: boolean; showDecimal?: boolean; accumulated?: boolean },
): string {
  if (value === undefined || value === null) return '-'
  const unit = getPreferredUnit(key, settings, options?.accumulated)
  const converted = convertToUnit(value, key, unit)
  return formatMetric(converted, unit, options)
}

/**
 * Retrieves the users preferred unit for the given metric.
 * NOTE: passing in settings allows for deciding on reactivity
 */
export function getPreferredUnit(key: ForecastParameter, settings: Settings, accumulated?: boolean) {
  let dimension = METRIC_DIMENSION[key]
  if (!dimension) return null

  // TODO: better handle accumulation
  if (accumulated && dimension === 'intensity') dimension = 'accumulation'

  return settings.general.units[dimension]
}
