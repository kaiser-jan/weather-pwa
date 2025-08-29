import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'meteofrance.fr_arome-france',
  internalId: 'arome_france',
  model: 'AROME France',
  name: 'France',
  url: '',
  // https://meteofrance.github.io/meteonet/english/data/weather-models/
  // TODO: sea level pressure!
  parameters: ['temperature', 'relative_humidity', 'wind_speed', 'wind_degrees', 'pressure', 'precipitation_amount'],
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 3 }),
  timespan: Duration.fromObject({ days: 2 }),
  spatialResolution: 2500,
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      // TODO:
      coordinates: [
        [
          [-5.0, 41.0],
          [10.0, 41.0],
          [10.0, 51.0],
          [-5.0, 51.0],
          [-5.0, 41.0],
        ],
      ],
    },
    properties: {},
  },
} as const satisfies Dataset
