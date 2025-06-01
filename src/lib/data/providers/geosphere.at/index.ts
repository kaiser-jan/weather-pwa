import type { DataProvider, ForecastValues } from '$lib/types/data'
import {
  combineTimePeriodsToDailyForecast,
  currentFromTimePeriods,
  forecastTotalFromDailyForecast,
  unifyTimePeriods,
} from '$lib/data/providers/utils'
import { DateTime } from 'luxon'
import { loadGeosphereNwpTimeseriesForecast } from './nwp/timeseries-forecast'
import nwpMeta from './nwp/meta'
import { loadGeosphereNowcastTimeseriesForecast } from './nowcast/timeseries-forecast'

export function useDataProviderGeosphereAT(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const hourlyFuture = await loadGeosphereNwpTimeseriesForecast(coordinates)
    const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwpMeta.interval.as('minutes')
    const hourlyPast = await loadGeosphereNwpTimeseriesForecast(coordinates, Math.floor(-requiredOffset))
    const hourlyPastOverlapIndex = hourlyPast.findIndex((h) => h.datetime >= hourlyFuture[0].datetime)
    let hourly = [...hourlyPast.slice(0, hourlyPastOverlapIndex), ...hourlyFuture]

    const daily = combineTimePeriodsToDailyForecast(hourly)

    const nowcast = await loadGeosphereNowcastTimeseriesForecast(coordinates)

    const total = forecastTotalFromDailyForecast(daily)

    const timePeriods = unifyTimePeriods([...nowcast, ...hourly])

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
