import type { Forecast, ForecastInputs } from '$lib/types/data'
import { deepEqual } from '$lib/utils/common'
import { DateTime, Duration } from 'luxon'

// ensure cached forecasts are discarded if they use an older data format (e.g. DateTime and Duration)
const CURRENT_FORECAST_DATA_VERSION = 2

type CachedForecast = {
  version: number
  forecast: Forecast
}

export function setCachedForecast(forecast: Forecast) {
  const cachedForecast: CachedForecast = {
    version: CURRENT_FORECAST_DATA_VERSION,
    forecast,
  }
  localStorage.setItem('last-forecast', JSON.stringify(cachedForecast))
}

export function getCachedForecast(inputs: ForecastInputs) {
  try {
    const lastForecastString = localStorage.getItem('last-forecast')
    if (!lastForecastString) return null

    const cached = JSON.parse(lastForecastString, luxonReviver) as CachedForecast

    const doesVersionMatch = cached.version !== CURRENT_FORECAST_DATA_VERSION
    const hasEqualInputs = deepEqual(inputs, cached.forecast.inputs)
    if (!hasEqualInputs && !doesVersionMatch) return null

    return cached.forecast
  } catch {}

  return null
}

export function luxonReviver(key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    if (key === 'datetime') {
      const dt = DateTime.fromISO(value)
      if (dt.isValid) return dt
    }
    if (key === 'duration') {
      const dur = Duration.fromISO(value)
      if (dur.isValid) return dur
    }
  }
  return value
}
