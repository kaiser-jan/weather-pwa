import type { Dataset } from '$lib/types/data/providers'
import { getForecastParametersFromConfig } from '$lib/utils/data'
import { Duration } from 'luxon'
import { configs } from '../loaders/nowcast'

export default {
  id: 'geosphere.at_nowcast-v1-15min-1km',
  name: 'INCA',
  label: 'Nowcast',
  url: 'https://data.hub.geosphere.at/dataset/nowcast-v1-15min-1km',
  parameters: getForecastParametersFromConfig(configs),
  offset: Duration.fromObject({ minutes: 30 }),
  interval: Duration.fromObject({ minutes: 15 }),
  timespan: Duration.fromObject({ minutes: 195 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [8.098, 45.502],
          [17.742, 45.502],
          [17.742, 49.478],
          [8.098, 49.478],
          [8.098, 45.502],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 1000,
} as const satisfies Dataset
