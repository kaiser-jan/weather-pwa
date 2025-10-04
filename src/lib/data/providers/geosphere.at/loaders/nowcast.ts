import { createLoaderMetaForDataset } from '$lib/data/providers'
import { getRequestedParametersFromConfig } from '$lib/utils/forecast/transformTimeseries'
import type { DatasetId } from '../datasets'
import type { Loader } from '$lib/types/data/providers'
import dataset, { configs } from '../datasets/nowcast'
import { createTimeseriesForecastLoader } from '../timeseriesLoader'

export default {
  ...createLoaderMetaForDataset<DatasetId>(dataset),
  load: createTimeseriesForecastLoader({
    dataset,
    mode: 'forecast',
    parameters: getRequestedParametersFromConfig(configs),
    configs,
  }),
} as const satisfies Loader<DatasetId>
