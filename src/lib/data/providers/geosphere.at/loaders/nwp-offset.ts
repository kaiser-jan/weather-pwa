import type { Coordinates } from '$lib/types/data'
import { DateTime } from 'luxon'
import { type DatasetId } from '../datasets'
import nwpLoader from '../loaders/nwp'
import type { Loader } from '$lib/types/data/providers'
import nwp, { NWP_MAX_OFFSET } from '../datasets/nwp'
import { createLoaderMetaForDataset } from '$lib/utils/data'

export default {
  ...createLoaderMetaForDataset<DatasetId>(nwp),
  load: loadTimeSeriesForecast,
} as const satisfies Loader<DatasetId>

async function loadTimeSeriesForecast(c: Coordinates) {
  const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwp.interval!.as('minutes')
  const offset = Math.min(NWP_MAX_OFFSET, Math.floor(-requiredOffset))
  return nwpLoader.load(c, offset)
}
