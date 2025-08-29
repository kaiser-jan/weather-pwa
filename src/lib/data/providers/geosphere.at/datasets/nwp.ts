import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'
import { getForecastParametersFromConfig, type TimeSeriesConfig } from '$lib/utils/forecast/transformTimeseries'
import type { ForecastParameter } from '$lib/types/data'

const AVAILABLE_WEATHER_PARAMETERS = [
  'cape',
  'cin',
  'grad',
  'mnt2m',
  'mxt2m',
  // 'rain_acc',
  'rh2m',
  'rr_acc',
  // 'snow_acc',
  // 'snowlmt',
  'sp',
  // 'sundur_acc',
  'sy',
  't2m',
  'tcc',
  'ugust',
  'u10m',
  'v10m',
  'vgust',
] as const satisfies string[]

export const configs: TimeSeriesConfig<(typeof AVAILABLE_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'temperature', inKey: 't2m', type: 'normal' },
  { outKey: 'temperature_min', inKey: 'mnt2m', type: 'normal' },
  { outKey: 'temperature_max', inKey: 'mxt2m', type: 'normal' },
  {
    outKey: 'precipitation_amount',
    inKey: 'rr_acc',
    type: 'accumulated-until',
    asDeltaPer: Duration.fromObject({ hours: 1 }),
  },
  { outKey: 'relative_humidity', inKey: 'rh2m', type: 'normal' },
  { outKey: 'pressure', inKey: 'sp', type: 'normal' },
  { outKey: 'cloud_coverage', inKey: 'tcc', type: 'normal', multiplier: 100 },
  { outKeyLength: 'wind_speed', outKeyAngle: 'wind_degrees', xKey: 'u10m', yKey: 'v10m', type: 'vector' },
  { outKeyLength: 'wind_speed_gust', outKeyAngle: 'wind_degrees_gust', xKey: 'ugust', yKey: 'vgust', type: 'vector' },
  // { outKey: 'symbol', inKey: 't2m', type: 'normal' },
  { outKey: 'cape', inKey: 'cape', type: 'normal' },
  { outKey: 'cin', inKey: 'cin', type: 'normal' },
  { outKey: 'grad', inKey: 'grad', type: 'normal' },
]

export default {
  id: 'geosphere.at_nwp-v1-1h-2500m',
  internalId: 'nwp-v1-1h-2500m',
  model: 'AROME',
  name: 'NWP',
  url: 'https://data.hub.geosphere.at/dataset/nwp-v1-1h-2500m',
  parameters: getForecastParametersFromConfig(configs),
  temporalResolution: Duration.fromObject({ hours: 1 }),
  baseForecastAge: Duration.fromObject({ hours: 4 }),
  updateFrequency: Duration.fromObject({ hours: 3 }),
  timespan: Duration.fromObject({ hours: 61 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [5.498, 42.981],
          [22.102, 42.981],
          [22.102, 51.819],
          [5.498, 51.819],
          [5.498, 42.981],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 2500,
} as const satisfies Dataset

export const NWP_MAX_OFFSET = 5
