import type { DataProvider, ForecastValues } from '$lib/types/data'
import { currentFromTimePeriods, forecastTotalFromDailyForecast } from '$lib/data/providers/utils'
import { loadMetnoLocationforecast } from './locationforecast'

export function useDataProviderMetNO(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const { timePeriods, daily } = await loadMetnoLocationforecast(coordinates)
    const total = forecastTotalFromDailyForecast(daily)
    const current = currentFromTimePeriods(timePeriods)

    return {
      current,
      timePeriods,
      daily,
      total,
    }
  }

  return {
    load,
  }
}
