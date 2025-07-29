import type { Dataset } from '$lib/types/data/providers'
import { getForecastParametersFromConfig } from '$lib/utils/data'
import { configs } from '../loaders/nwp'
import nwp, { NWP_MAX_OFFSET } from './nwp'

export default {
  ...nwp,
  id: 'geosphere.at_nwp-v1-1h-2500m_offset',
  name: 'AROME NWP Offset',
  parameters: getForecastParametersFromConfig(configs),
  offset: nwp.offset!.plus(nwp.interval!.mapUnits((x, _) => x * (1 + NWP_MAX_OFFSET))),
} as const satisfies Dataset
