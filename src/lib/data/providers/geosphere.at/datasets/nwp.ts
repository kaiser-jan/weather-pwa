import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'
import { configs } from '../loaders/nwp'
import { getForecastParametersFromConfig as getForecastParametersFromConfigs } from '$lib/utils/data'

export default {
  id: 'geosphere.at_nwp-v1-1h-2500m',
  name: 'AROME',
  label: 'NWP',
  url: 'https://data.hub.geosphere.at/dataset/nwp-v1-1h-2500m',
  parameters: getForecastParametersFromConfigs(configs),
  offset: Duration.fromObject({ hours: 4 }),
  interval: Duration.fromObject({ hours: 3 }),
  timespan: Duration.fromObject({ hours: 61 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [5.498, 42.981],
          [22.102, 42.981],
          [22.102, 51.819],
          [5.498, 51.819],
          [5.498, 42.981],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 2500,
} as const satisfies Dataset

export const NWP_MAX_OFFSET = 5
