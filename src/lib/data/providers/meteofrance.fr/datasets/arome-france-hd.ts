import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'meteofrance.fr_arome-france-hd',
  internalId: 'arome_france_hd',
  model: 'AROME France HD',
  name: 'France HD',
  url: '',
  // https://meteofrance.github.io/meteonet/english/data/weather-models/
  // TODO: sea level pressure!
  parameters: ['temperature', 'relative_humidity', 'wind_speed', 'wind_degrees', 'precipitation_amount'], // 'pressure',
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 3 }),
  timespan: Duration.fromObject({ days: 2 }),
  spatialResolution: 1500,
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
