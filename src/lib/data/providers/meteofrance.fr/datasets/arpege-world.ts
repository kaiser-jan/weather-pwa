import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'meteofrance.fr_arpege-world',
  internalId: 'arpege_world',
  model: 'ARPEGE World',
  name: 'Global',
  url: '',
  parameters: ['temperature', 'relative_humidity', 'wind_speed', 'wind_degrees', 'pressure', 'precipitation_amount'],
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 6 }),
  timespan: Duration.fromObject({ days: 4 }),
  spatialResolution: 25000,
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-180.0, -90.0],
          [180.0, -90.0],
          [180.0, 90.0],
          [-180.0, 90.0],
          [-180.0, -90.0],
        ],
      ],
    },
    properties: {},
  },
} as const satisfies Dataset
