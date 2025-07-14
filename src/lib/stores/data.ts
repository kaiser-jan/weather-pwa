import { readable, writable } from 'svelte/store'
import {
  combineMultiseriesToDailyForecast,
  forecastTotalFromDailyForecast,
  currentFromMultiseries,
} from '../data/utils'
import { mergeMultivariateTimeSeries } from '../utils/data'
import type { Coordinates, Forecast, MultivariateTimeSeries } from '$lib/types/data'
import { LOADERS, type DatasetId } from '$lib/data/providers'
import { debounce, deepEqual } from '$lib/utils'

const { subscribe, set } = writable<Forecast | null>(null)

export const forecastStore = {
  subscribe,
  update,
}

function update(coordinates: Coordinates, datasets: DatasetId[], stream = true) {
  // show cached data for this location while loading
  const cachedForecast = getCachedForecast(coordinates, datasets)
  if (cachedForecast) set(cachedForecast)

  set(null)
  const loaders = datasets.map((d) => LOADERS[d])
  const parts: (MultivariateTimeSeries | null)[] = Array(datasets.length).fill(null)
  const debouncedUpdate = debounce(() => updateForecast(parts), 100)

  for (const [loaderIndex, loader] of loaders.entries()) {
    loader(coordinates)
      .then((r) => {
        parts[loaderIndex] = r
        const isComplete = parts.filter((p) => p !== null).length === loaders.length
        if (stream || isComplete) debouncedUpdate()
      })
      .catch((e) => {
        console.warn(`Loading dataset ${datasets[loaderIndex]} failed!\n${e}`)
      })
  }

  function updateForecast(partsRaw: (MultivariateTimeSeries | null)[]) {
    const parts = partsRaw.filter((p) => p !== null)

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
    const current = currentFromMultiseries(merged)

    const forecast: Forecast = {
      current,
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
  datasets: DatasetId[]
  forecast: Forecast
}

function getCachedForecast(coordinates: Coordinates, datasets: DatasetId[]) {
  try {
    const lastForecastString = localStorage.getItem('last-forecast')
    if (!lastForecastString) return null
    const lastForecast = JSON.parse(lastForecastString) as CachedForecast
    const isValid = deepEqual(coordinates, lastForecast.coordinates) && deepEqual(datasets, lastForecast.coordinates)
    if (isValid) return lastForecast.forecast
  } catch (error) {}

  return null
}
