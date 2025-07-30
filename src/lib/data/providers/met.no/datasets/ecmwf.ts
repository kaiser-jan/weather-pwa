import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'met.no_ecmwf',
  name: 'ECMWF',
  label: 'Global',
  url: 'https://www.ecmwf.int/en/forecasts/datasets/set-i',
  parameters: [
    'pressure',
    'temperature',
    'cloud_coverage',
    // 'cloud_coverage_low',
    // 'cloud_coverage_medium',
    // 'cloud_coverage_high',
    // 'dew_point',
    'relative_humidity',
    'uvi_clear_sky',
    'wind_speed',
    'wind_degrees',

    'precipitation_amount',
    // 'precipitation_amount_min',
    // 'precipitation_amount_max',
    'precipitation_probability',
    // 'thunder_probability',
    'uvi_clear_sky',
  ],
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 1 }), // TODO: there are multiple resolutions for this dataset
  timespan: Duration.fromObject({ days: 10 }),
  spatialResolution: 9000,
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-180, -90],
          [180, -90],
          [180, 90],
          [-180, 90],
          [-180, -90],
        ],
      ],
    },
    properties: {},
  },
} as const satisfies Dataset
