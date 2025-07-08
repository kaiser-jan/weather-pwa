import type { Coordinates } from '$lib/types/data'
import type { Dataset } from '$lib/types/data/providers'
import { DateTime, Duration } from 'luxon'
import { loadTimeseriesForecast } from '../nwp/timeseries-forecast'
import nwp from '../nwp'

const meta: Dataset = {
  ...nwp.meta,
  name: 'AROME NWP Offset',
  offset: nwp.meta.offset!.plus(nwp.meta.interval!.mapUnits((x, _) => x * (1 + nwp.MAX_OFFSET))),
}

export default {
  meta,
  load: (c: Coordinates) => {
    const requiredOffset = DateTime.now().startOf('day').diffNow().as('minutes') / nwp.meta.interval!.as('minutes')
    const offset = Math.min(nwp.MAX_OFFSET, Math.floor(-requiredOffset))
    return loadTimeseriesForecast(c, offset)
  },
}
