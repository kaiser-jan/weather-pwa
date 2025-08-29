import type { Dataset } from '$lib/types/data/providers'
import { getForecastParametersFromConfig, type TimeSeriesConfig } from '$lib/utils/forecast/transformTimeseries'
import nwp, { configs, NWP_MAX_OFFSET } from './nwp'

export default {
  ...nwp,
  id: 'geosphere.at_nwp-v1-1h-2500m_offset',
  internalId: 'nwp-v1-1h-2500m',
  model: 'AROME Offset',
  name: 'NWP Offset',
  parameters: getForecastParametersFromConfig(configs),
  baseForecastAge: nwp.baseForecastAge!.plus(nwp.updateFrequency!.mapUnits((x, _) => x * (1 + NWP_MAX_OFFSET))),
} as const satisfies Dataset
