import type { Coordinates } from '$lib/types/data'
import { DateTime } from 'luxon'
import { type DatasetId } from '../datasets'
import nwpLoader from '../loaders/nwp'
import type { Loader } from '$lib/types/data/providers'
import nwp, { NWP_MAX_OFFSET } from '../datasets/nwp'

export default {
  id: 'geosphere.at_nwp-v1-1h-2500m_offset',
  url: 'https://data.hub.geosphere.at/dataset/nwp-v1-1h-2500m',
  datasetIds: ['geosphere.at_nwp-v1-1h-2500m_offset'],
  load: loadTimeSeriesForecast,
} as const satisfies Loader<DatasetId>

async function loadTimeSeriesForecast(c: Coordinates) {
  const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwp.interval!.as('minutes')
  const offset = Math.min(NWP_MAX_OFFSET, Math.floor(-requiredOffset))
  return nwpLoader.load(c, offset)
}
