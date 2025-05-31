import type { DataProvider, ForecastInstant } from '$lib/types/data'
import { currentFromHourly, forecastTotalFromDailyForecast } from '$lib/scripts/data/forecast/utils'
import { loadMetnoLocationforecast } from './locationforecast'

export function useDataProviderMetNO(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const { hourly, daily } = await loadMetnoLocationforecast(coordinates)
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
