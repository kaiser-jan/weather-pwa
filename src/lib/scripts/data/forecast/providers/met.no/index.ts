import type { DataProvider, ForecastInstant } from '$lib/types/data'
import { forecastTotalFromDailyForecast } from '$lib/scripts/data/forecast/utils'
import { loadMetnoLocationforecast } from './locationforecast'

export function useDataProviderMetNO(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const { hourly, daily } = await loadMetnoLocationforecast(coordinates)
    const total = forecastTotalFromDailyForecast(daily)

    return {
      current: hourly[0] as ForecastInstant,
      hourly,
      daily,
      total,
    }
  }

  return {
    load,
  }
}
