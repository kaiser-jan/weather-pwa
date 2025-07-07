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
import { loadMetnoLocationforecast } from '../met.no/locationforecast'

// TODO: perform api calls in parallel
export function useDataProviderGeosphereAT(): DataProvider {
  const load: DataProvider['load'] = async (coordinates) => {
    const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwpMeta.interval.as('minutes')
    const offset = Math.min(nwpMeta.maxOffset, Math.floor(-requiredOffset))

    // TODO: load according to config, combine in order
    const [hourlyFuture, hourlyPast, nowcast, metno] = await Promise.all([
      loadGeosphereNwpTimeseriesForecast(coordinates),
      graceful(loadGeosphereNwpTimeseriesForecast(coordinates, offset)),
      loadGeosphereNowcastTimeseriesForecast(coordinates),
      loadMetnoLocationforecast(coordinates),
    ])

    const hourly = hourlyPast ? addOlderMultiseries(hourlyFuture, hourlyPast) : hourlyFuture
    const multiseries = mergeMultivariateTimeSeries(metno, mergeMultivariateTimeSeries(hourly, nowcast))

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

// NOTE: workaround to allow parallel api calls and ignoring failure of one call
// TODO: this should be redundant when implementing proper error handling like with the ts-result Result type
async function graceful<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch {}
  return null
}

function addOlderMultiseries(a: MultivariateTimeSeries, b: MultivariateTimeSeries) {
  for (const parameter of Object.keys(b)) {
    const parameterTyped = parameter as keyof typeof a
    const aValues = a[parameterTyped]!
    const bValues = b[parameterTyped]!

    // HACK: some forecasts have some nullish values at the beginning, we try to ignore these
    const aFirstNonNullValueIndex = aValues?.[0].value === null ? aValues?.findIndex((a) => a.value !== null) : 0

    const hourlyPastOverlapIndex = bValues.findIndex(
      (h) => h.datetime >= aValues![aFirstNonNullValueIndex ?? 0].datetime,
    )
    a[parameterTyped] = aValues.slice(aFirstNonNullValueIndex)
    a[parameterTyped]?.unshift(...bValues.slice(0, hourlyPastOverlapIndex))
  }

  return a
}
