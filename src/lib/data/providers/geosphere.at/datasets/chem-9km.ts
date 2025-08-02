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
  { outKey: 'pm25', inKey: 'pm25surf', type: 'normal', multiplier: 1e-6 },
]

export default {
  id: 'geosphere.at_chem-v2-1h-9km',
  model: 'WRF-chem',
  name: 'Chemical Forecast Europe',
  url: 'https://data.hub.geosphere.at/dataset/chem-v2-1h-9km',
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
          [-58.9237691027579, 17.587355337819417],
          [82.9237691027579, 17.587355337819417],
          [82.9237691027579, 76.43395459487557],
          [-58.9237691027579, 76.43395459487557],
          [-58.9237691027579, 17.587355337819417],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 3000,
} as const satisfies Dataset

export const NWP_MAX_OFFSET = 5
