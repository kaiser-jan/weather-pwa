import { createLoaderMetaForDataset, getRequestedParametersFromConfig } from '$lib/utils/data'
import type { DatasetId } from '../datasets'
import type { Loader } from '$lib/types/data/providers'
import dataset, { configs } from '../datasets/chem-9km'
import { createTimeseriesForecastLoader } from '../timeseriesLoader'

export default {
  ...createLoaderMetaForDataset<DatasetId>(dataset),
  load: createTimeseriesForecastLoader({
    dataset,
    mode: 'forecast',
    model: 'chem-v2-1h-9km',
    parameters: getRequestedParametersFromConfig(configs),
    configs,
    isPressureSurfaceLevel: false,
  }),
} as const satisfies Loader<DatasetId>
