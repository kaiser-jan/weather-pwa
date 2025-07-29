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
