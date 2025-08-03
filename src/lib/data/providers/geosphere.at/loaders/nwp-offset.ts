import type { Coordinates } from '$lib/types/data'
import { DateTime } from 'luxon'
import { type DatasetId } from '../datasets'
import nwpLoader from '../loaders/nwp'
import type { Loader } from '$lib/types/data/providers'
import dataset from '../datasets/nwp-offset'
import { createLoaderMetaForDataset } from '$lib/data/providers'
import { NWP_MAX_OFFSET } from '../datasets/nwp'

export default {
  ...createLoaderMetaForDataset<DatasetId>(dataset),
  load: loadTimeSeriesForecast,
} as const satisfies Loader<DatasetId>

async function loadTimeSeriesForecast(c: Coordinates) {
  const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / dataset.updateFrequency!.as('minutes')
  const offset = Math.min(NWP_MAX_OFFSET, Math.floor(-requiredOffset))
  return nwpLoader.load(c, offset)
}
