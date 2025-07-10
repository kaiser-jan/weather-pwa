import { readable, writable } from 'svelte/store'
import {
  combineMultiseriesToDailyForecast,
  forecastTotalFromDailyForecast,
  currentFromMultiseries,
} from '../data/utils'
import { mergeMultivariateTimeSeries } from '../utils/data'
import type { Coordinates, Forecast, MultivariateTimeSeries } from '$lib/types/data'
import { LOADERS, type DatasetId } from '$lib/data/providers'
import { debounce } from '$lib/utils'

const emptyForecast: Forecast = { current: null, multiseries: [], daily: [], total: null }

const { subscribe, set } = writable<Forecast>(emptyForecast)

function update(coordinates: Coordinates, datasets: DatasetId[], stream = true) {
  set(emptyForecast)
  const loaders = datasets.map((d) => LOADERS[d])
  const parts: (MultivariateTimeSeries | null)[] = Array(datasets.length).fill(null)
  const debouncedUpdate = debounce(() => updateForecast(parts, set), 50)

  for (const [loaderIndex, loader] of loaders.entries()) {
    loader(coordinates)
      .then((r) => {
        parts[loaderIndex] = r
        const isComplete = parts.length === loaders.length
        if (stream || isComplete) debouncedUpdate()
      })
      .catch(() => {
        console.warn(`Loading dataset ${datasets[loaderIndex]} failed!`)
      })
  }
}

function updateForecast(partsRaw: (MultivariateTimeSeries | null)[], set: (f: Forecast) => void) {
  const parts = partsRaw.filter((p) => p !== null)

  let merged = parts[0]
  for (let i = 1; i < parts.length; i++) {
    merged = mergeMultivariateTimeSeries(merged, parts[i])
  }

  const daily = combineMultiseriesToDailyForecast(merged)
  const total = forecastTotalFromDailyForecast(daily)
  const current = currentFromMultiseries(merged)

  set({
    current,
    multiseries: merged,
    daily,
    total,
  })
}

export const forecastStore = {
  subscribe,
  update,
}
