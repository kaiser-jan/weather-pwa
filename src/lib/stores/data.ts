import { get, readonly, writable } from 'svelte/store'
import { combineMultiseriesToDailyForecast, forecastTotalFromDailyForecast } from '$lib/data/utils'
import { mergeMultivariateTimeSeries } from '$lib/utils/data'
import type { Coordinates, Forecast, MultivariateTimeSeries } from '$lib/types/data'
import { getLoadersForDataset, type DatasetId } from '$lib/data/providers'
import { debounce, deepEqual } from '$lib/utils'
import { DateTime, Duration } from 'luxon'
import { coordinates } from './location'
import { settings } from '$lib/settings/store'
import { NOW } from './now'
import { subscribeNonImmediate } from '$lib/utils/state.svelte'

const _isForecastLoading = writable(false)
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
  const datasetIds = get(settings).data.datasets
  const stream = get(settings).data.incrementalLoad
  if (!_coordinates) {
    console.warn('Cannot update, no coordinates!')
    return
  }
  updateWith(_coordinates, datasetIds, stream)
}

export const forecastStore = {
  subscribe,
  update,
}

export const isForecastLoading = readonly(_isForecastLoading)

function onLoadingStart() {
  _isForecastLoading.set(true)
}
function onLoadingDone() {
  setTimeout(() => _isForecastLoading.set(false), 500)
}

function updateWith(coordinates: Coordinates, datasets: readonly DatasetId[], stream = true) {
  console.info('Loading data...')
  onLoadingStart()
  set(null)

  // show cached data for this location while loading
  const cachedForecast = getCachedForecast(coordinates, datasets)
  if (cachedForecast) {
    set(cachedForecast)
  }

  const loaders = datasets.map((d) => getLoadersForDataset(d))
  const parts: (MultivariateTimeSeries | null | false)[] = Array(datasets.length).fill(null)
  const debouncedUpdate = debounce(() => updateForecast(parts), 500)

  for (const [loaderIndex, loader] of loaders.entries()) {
    loader
      ?.load(coordinates)
      .then((r) => {
        parts[loaderIndex] = r
      })
      .catch((e) => {
        console.warn(`Loading dataset ${datasets[loaderIndex]} failed!\n${e}`)
        parts[loaderIndex] = false
      })
      .finally(() => {
        updateIfComplete()
      })
  }

  function updateIfComplete() {
    const isComplete = parts.filter((p) => p !== null).length === loaders.length
    if (stream || isComplete) debouncedUpdate()
    if (isComplete) {
      onLoadingDone()
      clearTimeout(loadTimeout)
    }
  }

  clearTimeout(loadTimeout)
  loadTimeout = setTimeout(() => {
    console.warn('Timed out while loading complete forecast, updating anyway!')
    debouncedUpdate()
  }, 15_000)

  function updateForecast(partsRaw: (MultivariateTimeSeries | null | false)[]) {
    const parts = partsRaw.filter((p) => p !== null && p !== false)

    if (parts.length === 0) {
      set(null)
      return
    }

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
      datasets,
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
