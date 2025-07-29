import type { Dataset } from '$lib/types/data/providers'
import { getForecastParametersFromConfig } from '$lib/utils/data'
import { DateTime, Duration } from 'luxon'
import { configs } from '../loaders/inca'

export default {
  id: 'geosphere.at_inca-v1-1h-1km',
  name: 'INCA',
  label: 'Analysis',
  url: 'https://data.hub.geosphere.at/dataset/inca-v1-1h-1km',
  parameters: getForecastParametersFromConfig(configs),
  offset: DateTime.fromISO('2011-03-15T00:00+00:00').diffNow().negate(),
  interval: Duration.fromObject({ minutes: 60 }),
  timespan: Duration.fromObject({ minutes: 0 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [8.098133748352293, 45.77222010581118],
          [17.742270413233744, 45.77222010581118],
          [17.742270413233744, 49.478175684609575],
          [8.098133748352293, 49.478175684609575],
          [8.098133748352293, 45.77222010581118],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 1000,
} as const satisfies Dataset
