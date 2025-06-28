import type { DataProvider } from '$lib/types/data'
import {
  combineMultiseriesToDailyForecast,
  currentFromMultiseries,
  forecastTotalFromDailyForecast,
} from '$lib/data/providers/utils'
import { loadMetnoLocationforecast } from './locationforecast'

export function useDataProviderMetNO(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const { multiseries } = await loadMetnoLocationforecast(coordinates)
    // TODO: consider using min/max temperature etc.
    const daily = combineMultiseriesToDailyForecast(multiseries)
    const total = forecastTotalFromDailyForecast(daily)
    const current = currentFromMultiseries(multiseries)

    return {
      current,
      multiseries,
      daily,
      total,
    }
  }

  return {
    load,
  }
}
