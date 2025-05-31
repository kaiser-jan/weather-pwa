import type { DataProvider, ForecastInstant } from '$lib/types/data'
import {
  combineHourlyToDailyForecast,
  currentFromHourly,
  forecastTotalFromDailyForecast,
} from '$lib/scripts/data/forecast/utils'
import { loadGeosphereForecastHourly } from './hourly'

export function useDataProviderGeosphereAT(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const hourly = await loadGeosphereForecastHourly(coordinates)
    const daily = combineHourlyToDailyForecast(hourly)
    const total = forecastTotalFromDailyForecast(daily)
    const current = currentFromHourly(hourly)

    return {
      current,
      hourly,
      daily,
      total,
    }
  }

  return {
    load,
  }
}
