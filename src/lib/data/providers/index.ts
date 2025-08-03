import type { Dataset, Loader, Provider } from '$lib/types/data/providers'
import geosphereat from './geosphere.at'
import metno from './met.no'

const _PROVIDERS = [metno.provider, geosphereat.provider] as const
const _DATASETS = [...metno.datasets, ...geosphereat.datasets] as const
const _LOADERS = [...metno.loaders, ...geosphereat.loaders] as const

export const DATASET_IDS = _DATASETS.map((d) => d.id)

export const PROVIDERS = _PROVIDERS as readonly Provider[]
export const DATASETS = _DATASETS as readonly Dataset[]
const LOADERS = _LOADERS as readonly Loader<DatasetId>[]

export type DatasetId = (typeof DATASET_IDS)[number]
export type ProviderId = (typeof PROVIDERS)[number]['id']

export function getLoadersForDataset(datasetId: DatasetId): Loader<DatasetId> | null {
  return LOADERS.find((l) => l.datasetIds.includes(datasetId)) ?? null
}

export function getMinimalLoadersForDatasets(datasetIds: readonly DatasetId[]): Loader<DatasetId>[] {
  const selectedLoaders: Loader<DatasetId>[] = []
  const coveredDatasets = new Set<DatasetId>()

  for (const datasetId of datasetIds) {
    if (coveredDatasets.has(datasetId)) continue

    const matchingLoaders = LOADERS.filter((l) => l.datasetIds.includes(datasetId))

    let bestLoader: Loader<DatasetId> | null = null
    let bestCoverage = 0

    for (const loader of matchingLoaders) {
      const addedCoverage = loader.datasetIds.filter((d) => !coveredDatasets.has(d) && datasetIds.includes(d)).length
      if (addedCoverage > bestCoverage) {
        bestLoader = loader
        bestCoverage = addedCoverage
      }
    }

    if (bestLoader) {
      selectedLoaders.push(bestLoader)
      bestLoader.datasetIds.forEach((d) => coveredDatasets.add(d))
    }
  }

  return selectedLoaders
}

export function createLoaderMetaForDataset<DatasetIdT extends string>(dataset: Dataset) {
  return {
    id: dataset.id as DatasetIdT,
    name: dataset.name,
    url: dataset.url,
    datasetIds: [dataset.id as DatasetIdT],
  } as const
}
