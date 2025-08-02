import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'met.no_meps',
  model: 'MEPS',
  name: 'Nordic area',
  url: 'https://doi.org/10.1002/qj.3525',
  parameters: [
    'pressure',
    'temperature',
    'temperature_min',
    'temperature_max',
    'cloud_coverage',
    // 'cloud_coverage_low',
    // 'cloud_coverage_medium',
    // 'cloud_coverage_high',
    // 'dew_point',
    'fog',
    'relative_humidity',
    'uvi_clear_sky',
    'wind_speed',
    'wind_degrees',
    'wind_speed_gust',

    'precipitation_amount',
    // 'precipitation_amount_min',
    // 'precipitation_amount_max',
    'precipitation_probability',
    'thunder_probability',
    'uvi_clear_sky',
  ],
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 1 }), // TODO:
  timespan: Duration.fromObject({ hours: 60 }),
  spatialResolution: 2500,
  // ncdump -h "https://thredds.met.no/thredds/dodsC/mepslatest/meps_lagged_6_h_latest_2_5km_latest.nc"
  coverageArea: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-18.1, 49.8],
          [54.2, 49.8],
          [54.2, 75.2],
          [-18.1, 75.2],
          [-18.1, 49.8],
        ],
      ],
    },
  },
} as const satisfies Dataset
