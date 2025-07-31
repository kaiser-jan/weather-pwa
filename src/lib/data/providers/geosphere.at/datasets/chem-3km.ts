import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'
import { getForecastParametersFromConfig, type TimeSeriesConfig } from '$lib/utils/data'
import type { ForecastParameter } from '$lib/types/data'

const AVAILABLE_WEATHER_PARAMETERS = [
  'no2surf', // Nitrogen dioxide concentration close to the surface (ug m-3)
  'o3surf', // Ozone concentration close to the surface (mg m-3)
  'pm10surf', // PM10 concentration close to the surface (ug m-3)
  'pm25surf', // PM2.5 concentration close to the surface (ug m-3)
] as const satisfies string[]

export const configs: TimeSeriesConfig<(typeof AVAILABLE_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'no2', inKey: 'no2surf', type: 'normal', multiplier: 1e-6 },
  { outKey: 'o3', inKey: 'o3surf', type: 'normal', multiplier: 1e-6 },
  { outKey: 'pm10', inKey: 'pm10surf', type: 'normal', multiplier: 1e-6 },
  { outKey: 'pm2_5', inKey: 'pm25surf', type: 'normal', multiplier: 1e-6 },
]

export default {
  id: 'geosphere.at_chem-v2-1h-3km',
  name: 'WRF-chem',
  label: 'Chemical Forecast Central Europe',
  url: 'https://data.hub.geosphere.at/dataset/chem-v2-1h-3km',
  parameters: getForecastParametersFromConfig(configs),
  temporalResolution: Duration.fromObject({ hours: 1 }),
  baseForecastAge: Duration.fromObject({ hours: 0 }),
  updateFrequency: Duration.fromObject({ hours: 24 }),
  timespan: Duration.fromObject({ hours: 73 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [4.340221595810885, 41.71628557542017],
          [18.97233132399459, 41.71628557542017],
          [18.97233132399459, 50.148087967884145],
          [4.340221595810885, 50.148087967884145],
          [4.340221595810885, 41.71628557542017],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 3000,
} as const satisfies Dataset

export const NWP_MAX_OFFSET = 5
