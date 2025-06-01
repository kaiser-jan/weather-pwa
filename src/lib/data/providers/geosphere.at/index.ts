import type { DataProvider, ForecastInstant } from '$lib/types/data'
import {
  combineHourlyToDailyForecast,
  currentFromHourly,
  forecastTotalFromDailyForecast,
} from '$lib/data/providers/utils'
import { DateTime } from 'luxon'
import { loadGeosphereNwpTimeseriesForecast } from './nwp/timeseries-forecast'
import nwpMeta from './nwp/meta'

export function useDataProviderGeosphereAT(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const hourlyFuture = await loadGeosphereNwpTimeseriesForecast(coordinates)
    const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwpMeta.interval.as('minutes')
    const hourlyPast = await loadGeosphereNwpTimeseriesForecast(coordinates, Math.floor(-requiredOffset))
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
