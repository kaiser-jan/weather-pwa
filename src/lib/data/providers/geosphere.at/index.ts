import type { DataProvider, MultivariateTimeSeries } from '$lib/types/data'
import {
  combineMultiseriesToDailyForecast,
  currentFromMultiseries,
  forecastTotalFromDailyForecast,
} from '$lib/data/providers/utils'
import { DateTime, Duration } from 'luxon'
import { loadGeosphereNwpTimeseriesForecast } from './nwp/timeseries-forecast'
import nwpMeta from './nwp/meta'
import { loadGeosphereNowcastTimeseriesForecast } from './nowcast/timeseries-forecast'
import { mergeMultivariateTimeSeries } from '$lib/utils/data'

// TODO: perform api calls in parallel
export function useDataProviderGeosphereAT(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const hourlyFuture = await loadGeosphereNwpTimeseriesForecast(coordinates)

    let hourly = hourlyFuture
    try {
      const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwpMeta.interval.as('minutes')
      const offset = Math.min(nwpMeta.maxOffset, Math.floor(-requiredOffset))

      const hourlyPast = await loadGeosphereNwpTimeseriesForecast(coordinates, offset)

      for (const [parameter, pastValues] of Object.entries(hourlyPast)) {
        const parameterTyped = parameter as keyof typeof hourlyFuture
        const hourlyPastOverlapIndex = pastValues.findIndex(
          (h) => h.datetime >= hourlyFuture[parameterTyped]![0].datetime,
        )
        hourly[parameterTyped]?.unshift(...pastValues.slice(0, hourlyPastOverlapIndex))
      }
    } catch (error) {}

    const nowcast = await loadGeosphereNowcastTimeseriesForecast(coordinates)

    const multiseries = mergeMultivariateTimeSeries(nowcast, hourly)

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
