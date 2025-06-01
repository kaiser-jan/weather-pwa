import type { DataProvider, ForecastInstant } from '$lib/types/data'
import {
  combineHourlyToDailyForecast,
  currentFromHourly,
  forecastTotalFromDailyForecast,
} from '$lib/data/providers/utils'
import { loadGeosphereForecastHourly } from './hourly'
import { DateTime } from 'luxon'
import { MODEL_INTERVAL } from './meta'

export function useDataProviderGeosphereAT(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const hourlyFuture = await loadGeosphereForecastHourly(coordinates)
    const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / MODEL_INTERVAL.as('minutes')
    const hourlyPast = await loadGeosphereForecastHourly(coordinates, Math.floor(-requiredOffset))
    const hourlyPastOverlapIndex = hourlyPast.findIndex((h) => h.datetime >= hourlyFuture[0].datetime)
    let hourly = [...hourlyPast.slice(0, hourlyPastOverlapIndex), ...hourlyFuture]

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
