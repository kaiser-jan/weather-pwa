import { get, readable, readonly, writable } from 'svelte/store'
import { mergeMultivariateTimeSeries } from '$lib/utils/forecast/multiseries'
import type { Coordinates, Forecast, MultivariateTimeSeries } from '$lib/types/data'
import { getLoadersForDataset, getMinimalLoadersForDatasets, type DatasetId } from '$lib/data/providers'
import { debounce, deepEqual } from '$lib/utils'
import { DateTime, Duration } from 'luxon'
import { coordinates } from './location'
import { settings } from '$lib/settings/store'
import { NOW } from './now'
import { getSuggestedDatasetsForLocation } from '$lib/data/providers/suggestedDatasets'
import { DATASET_IDS_BY_PRIORITY } from '$lib/config/datasets'
import type { Loader, LoaderResult } from '$lib/types/data/providers'
import { subscribeNonImmediate } from '$lib/utils/stores'
import { combineMultiseriesToDailyForecast } from '$lib/utils/forecast/daily'
import { forecastTotalFromDailyForecast } from '$lib/utils/forecast/total'

// ensure cached forecasts are discarded if they use an older data format (e.g. DateTime and Duration)
const CURRENT_FORECAST_DATA_VERSION = 2

let loadTimeout: ReturnType<typeof setTimeout> | undefined = undefined

const { subscribe, set } = writable<Forecast | null>(null, () => {
  const subscriptionCoordinates = subscribeNonImmediate(coordinates, () => update('coordinates'))
  const subscriptionDatetime = subscribeNonImmediate(NOW, () => update('datetime'))
  const subscriptionDatasets = subscribeNonImmediate(
    settings.select((s) => s.data.datasets),
    () => update('datasets'),
  )

  update('init')

  return () => {
    subscriptionCoordinates()
    subscriptionDatetime()
    subscriptionDatasets()
  }
})

function update(cause: string) {
  console.debug('update', cause)
  const _coordinates = get(coordinates)
  if (!_coordinates) {
    console.warn('Cannot update, no coordinates!')
    return
  }
  // const datasetIds = get(settings).data.datasets
  const datasetIds = getSuggestedDatasetsForLocation(_coordinates, DATASET_IDS_BY_PRIORITY)
  const stream = get(settings).data.incrementalLoad
  updateWith(
    _coordinates,
    datasetIds.map((d) => d.id as DatasetId),
    stream,
  )
}

export const forecastStore = {
  subscribe,
  update,
}

export type LoaderState =
  | {
      done: false
      loader: Loader<DatasetId>
    }
  | ({
      done: true
      loader: Loader<DatasetId>
    } & LoaderResult)

const _loaderStates = writable<LoaderState[]>([])
export const loaderStates = readonly(_loaderStates)

function updateWith(coordinates: Coordinates, datasetIds: readonly DatasetId[], stream = true) {
  console.info('Loading data...')

  const areParametersUnchanged =
    deepEqual(coordinates, get(forecastStore)?.coordinates) && deepEqual(datasetIds, get(forecastStore)?.datasetIds)

  if (!get(forecastStore) || !areParametersUnchanged) {
    // show cached data for this location while loading
    const cachedForecast = getCachedForecast(coordinates, datasetIds)
    if (cachedForecast) {
      console.debug('no forecast, using cached')
      set(cachedForecast)
    } else {
      console.debug('no cached forecast, resetting')
      set(null)
    }
  }

  const loaders = getMinimalLoadersForDatasets(datasetIds)
  console.debug('Using the following loaders: ', loaders)
  const states: LoaderState[] = loaders.map((loader) => ({ done: false, loader }))
  const debouncedUpdate = debounce(() => updateForecast(states), 500)
  _loaderStates.set(states)

  for (const [loaderIndex, loader] of loaders.entries()) {
    loader
      ?.load(coordinates)
      .then((result) => {
        states[loaderIndex] = { done: true, ...result, loader }
      })
      .catch((error) => {
        // TODO: consider using a result pattern
        console.warn(`Loading dataset ${datasetIds[loaderIndex]} failed!\n${error}`)
        states[loaderIndex] = { done: true, loader, success: false, error }
      })
      .finally(() => {
        const done = states.filter(Boolean).length === loaders.length
        _loaderStates.set(states)
        const wasCached = states[loaderIndex].done && states[loaderIndex].success && states[loaderIndex].cached
        const needsRefresh = !wasCached || !areParametersUnchanged
        const shouldUpdate = stream || done
        console.debug('loader', loader.id, wasCached, areParametersUnchanged, shouldUpdate)
        if (shouldUpdate && needsRefresh) debouncedUpdate()
        if (done) {
          clearTimeout(loadTimeout)
        }
      })
  }

  clearTimeout(loadTimeout)
  loadTimeout = setTimeout(() => {
    console.warn('Timed out while loading complete forecast, updating anyway!')
    debouncedUpdate()
  }, 15_000)

  function updateForecast(results: LoaderState[]) {
    console.debug('updating forecast')

    // NOTE: reverse, so the first items take priority
    const parts = results
      .filter((p) => p.done && p.success)
      .reverse()
      .map((p) => p.data)

    if (parts.length === 0) return

    let merged = parts[0]
    for (let i = 1; i < parts.length; i++) {
      merged = mergeMultivariateTimeSeries(merged, parts[i])
    }

    const daily = combineMultiseriesToDailyForecast(merged)
    const total = forecastTotalFromDailyForecast(daily)

    const forecast: Forecast = {
      current: null,
      multiseries: merged,
      daily,
      total,
      coordinates,
      datasetIds,
    }

    console.info(forecast)

    set(forecast)

    const cachedForecast: CachedForecast = {
      version: CURRENT_FORECAST_DATA_VERSION,
      forecast,
    }
    localStorage.setItem('last-forecast', JSON.stringify(cachedForecast))
  }
}

type CachedForecast = {
  version: number
  forecast: Forecast
}

export function luxonReviver(key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    if (key === 'datetime') {
      const dt = DateTime.fromISO(value)
      if (dt.isValid) return dt
    }
    if (key === 'duration') {
      const dur = Duration.fromISO(value)
      if (dur.isValid) return dur
    }
  }
  return value
}

function getCachedForecast(coordinates: Coordinates, datasets: readonly DatasetId[]) {
  try {
    const lastForecastString = localStorage.getItem('last-forecast')
    if (!lastForecastString) return null
    const lastForecast = JSON.parse(lastForecastString, luxonReviver) as CachedForecast
    if (lastForecast.version !== CURRENT_FORECAST_DATA_VERSION) return null
    const isValid =
      deepEqual(coordinates, lastForecast.forecast.coordinates) && deepEqual(datasets, lastForecast.forecast.datasetIds)
    if (isValid) return lastForecast.forecast
  } catch {}

  return null
}
