import { DATASET_IDS_BY_PRIORITY } from '$lib/config/datasets'
import { type DatasetId } from '$lib/data/providers'
import { getSuggestedDatasetsForLocation } from '$lib/data/providers/suggestedDatasets'
import { settings } from '$lib/settings/store'
import type { Forecast } from '$lib/types/data'
import { refreshForecast } from '$lib/utils/forecast/load'
import { subscribeNonImmediate } from '$lib/utils/stores'
import { get, readonly, writable } from 'svelte/store'
import { coordinates } from './location'
import { NOW } from './now'
import type { LoaderState } from '$lib/types/data/providers'

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
  const datasetIds = getSuggestedDatasetsForLocation(_coordinates, get(settings).data.datasets)
  const stream = get(settings).data.incrementalLoad

  refreshForecast({
    current: get(forecastStore),
    update: set,
    inputs: {
      coordinates: _coordinates,
      datasetIds: datasetIds.map((d) => d.id as DatasetId),
    },
    stream,
  })
}

export const loaderStates = writable<LoaderState[]>([])

export const forecastStore = {
  subscribe,
  update,
}
