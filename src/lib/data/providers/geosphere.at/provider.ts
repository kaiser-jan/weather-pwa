import type { Provider } from '$lib/types/data/providers'
import { datasets } from './datasets'
import { loaders } from './loaders'

export const provider = {
  id: 'geosphere.at',
  name: 'GeoSphere Austria',
  url: 'https://geosphere.at/',
  country: 'AT',
  loaderIds: loaders.map((l) => l.id) as (typeof loaders)[number]['id'][],
  datasetIds: datasets.map((d) => d.id) as (typeof datasets)[number]['id'][],
} as const satisfies Provider
