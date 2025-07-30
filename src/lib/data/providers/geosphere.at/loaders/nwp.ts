import { createLoaderMetaForDataset, getRequestedParametersFromConfig } from '$lib/utils/data'
import type { DatasetId } from '../datasets'
import type { Loader } from '$lib/types/data/providers'
import dataset, { configs } from '../datasets/nwp'
import { createTimeseriesForecastLoader } from '../timeseriesLoader'

export default {
  ...createLoaderMetaForDataset<DatasetId>(dataset),
  load: createTimeseriesForecastLoader({
    dataset,
    mode: 'forecast',
    model: 'nwp-v1-1h-2500m',
    parameters: getRequestedParametersFromConfig(configs),
    configs,
    isPressureSurfaceLevel: true,
  }),
} as const satisfies Loader<DatasetId>
