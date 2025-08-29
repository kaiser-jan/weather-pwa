import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'meteofrance.fr_arpege-europe',
  internalId: 'arpege_europe',
  model: 'ARPEGE Europe',
  name: 'Europe',
  url: '',
  parameters: ['temperature', 'relative_humidity', 'wind_speed', 'wind_degrees', 'pressure', 'precipitation_amount'],
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 6 }),
  timespan: Duration.fromObject({ hours: 102 }),
  spatialResolution: 11000,
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      // TODO:
      coordinates: [
        [
          [-25.0, 35.0],
          [45.0, 35.0],
          [45.0, 72.0],
          [-25.0, 72.0],
          [-25.0, 35.0],
        ],
      ],
    },
    properties: {},
  },
} as const satisfies Dataset
