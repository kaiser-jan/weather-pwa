import { get, readable, readonly, writable } from 'svelte/store'
import { combineMultiseriesToDailyForecast, forecastTotalFromDailyForecast } from '$lib/data/utils'
import { mergeMultivariateTimeSeries } from '$lib/utils/data'
import type { Coordinates, Forecast, MultivariateTimeSeries } from '$lib/types/data'
import { getLoadersForDataset, getMinimalLoadersForDatasets, type DatasetId } from '$lib/data/providers'
import { debounce, deepEqual } from '$lib/utils'
import { DateTime, Duration } from 'luxon'
import { coordinates } from './location'
import { settings } from '$lib/settings/store'
import { NOW } from './now'
import { subscribeNonImmediate } from '$lib/utils/state.svelte'
import { getSuggestedDatasetsForLocation } from '$lib/data/providers/suggestedDatasets'
import { DATASET_IDS_BY_PRIORITY } from '$lib/config/datasets'
import type { Loader } from '$lib/types/data/providers'

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

type LoaderResult =
  | {
      loader: Loader<DatasetId>
      done: false
    }
  | {
      loader: Loader<DatasetId>
      done: true
      success: true
      result: MultivariateTimeSeries
    }
  | {
      loader: Loader<DatasetId>
      done: true
      success: false
      error: string
    }

const _loaderResults = writable<LoaderResult[]>([])
export const loaderResults = readonly(_loaderResults)

function updateWith(coordinates: Coordinates, datasetsIds: readonly DatasetId[], stream = true) {
  console.info('Loading data...')

  // show cached data for this location while loading
  const cachedForecast = getCachedForecast(coordinates, datasetsIds)
  if (cachedForecast) {
    set(cachedForecast)
  } else {
    set(null)
  }

  const loaders = getMinimalLoadersForDatasets(datasetsIds)
  const results: LoaderResult[] = loaders.map((loader) => ({ done: false, loader }))
  const debouncedUpdate = debounce(() => updateForecast(results), 500)
  _loaderResults.set(results)

  for (const [loaderIndex, loader] of loaders.entries()) {
    loader
      ?.load(coordinates)
      .then((result) => {
        results[loaderIndex] = { done: true, success: true, result, loader }
      })
      .catch((error) => {
        console.warn(`Loading dataset ${datasetsIds[loaderIndex]} failed!\n${error}`)
        results[loaderIndex] = { done: true, success: false, error, loader }
      })
      .finally(() => {
        const done = results.filter(Boolean).length === loaders.length
        _loaderResults.set(results)
        if (stream || done) debouncedUpdate()
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

  function updateForecast(results: LoaderResult[]) {
    // NOTE: reverse, so the first items take priority
    const parts = results
      .filter((p) => p.done && p.success)
      .reverse()
      .map((p) => p.result)

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
    }

    console.info(forecast)

    set(forecast)

    const cachedForecast: CachedForecast = {
      coordinates,
      datasets: datasetsIds,
      forecast,
    }
    localStorage.setItem('last-forecast', JSON.stringify(cachedForecast))
  }
}

type CachedForecast = {
  coordinates: Coordinates
  datasets: readonly DatasetId[]
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
    const isValid = deepEqual(coordinates, lastForecast.coordinates) && deepEqual(datasets, lastForecast.datasets)
    if (isValid) return lastForecast.forecast
  } catch {}

  return null
}
