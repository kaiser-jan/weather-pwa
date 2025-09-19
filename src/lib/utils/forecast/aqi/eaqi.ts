import { EAQI } from '$lib/config/categorization'
import { convertToUnit } from '$lib/utils/units'

export type ForecastParameterAirPollution = keyof typeof EAQI.limits

/**
 * Determines the indices the given value lies between on the given scale and interpolates the indices.
 */
export function getInterpolatedScaleIndex(value: number, scale: readonly number[]): number {
  for (let i = 1; i < scale.length - 1; i++) {
    const lower = scale[i]
    const upper = scale[i + 1]
    if (value < upper) {
      const t = (value - lower) / (upper - lower)
      return i + t
    }
  }
  return scale.length - 1
}

/**
 * Calculates the EAQI indices for the given values.
 */
export function getEaqiLevels(values: Partial<Record<ForecastParameterAirPollution, number | undefined>>) {
  const levels = {} as Record<ForecastParameterAirPollution, number>
  for (const key in EAQI.limits) {
    const param = key as ForecastParameterAirPollution
    const value = values[param]
    if (value === null || value === undefined) return
    levels[param] = getInterpolatedScaleIndex(convertToUnit(value, param, 'ug/m3'), EAQI.limits[param])
  }
  return levels
}

/**
 * Calculates the EAQI from the EAQI per-pollutant levels by taking the worst one.
 */
export function getTotalEaqiIndex(levels: Record<string, number> | undefined): number | undefined {
  if (!levels) return undefined
  return Math.max(0, ...Object.values(levels))
}
