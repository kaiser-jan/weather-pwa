import type { ForecastParameter } from '$lib/types/data'
import type { Dataset } from '$lib/types/data/providers'
import { getForecastParametersFromConfig, type TimeSeriesConfig } from '$lib/utils/data'
import { Duration } from 'luxon'

const AVAILABLE_WEATHER_PARAMETERS = [
  't2m', // Air temperature 2m above ground
  'rh2m', // Relative humidity 2m above ground
  'pt', // Precipitation type
  'rr', // Precipitation sum
  'ff', // 10m wind speed
  'fx', // 10m gust speed
  'dd', // 10m wind direction
  // 'td', // Dew point temperature 2m above ground
] as const satisfies string[]

export const configs: TimeSeriesConfig<(typeof AVAILABLE_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'temperature', inKey: 't2m', type: 'normal' },
  { outKey: 'relative_humidity', inKey: 'rh2m', type: 'normal' },
  { outKey: 'precipitation_amount', inKey: 'rr', type: 'normal', multiplier: 4 }, // * 4 to go from mm/15min to mm/h
  { outKey: 'wind_speed', inKey: 'ff', type: 'normal' },
  { outKey: 'wind_degrees', inKey: 'dd', type: 'normal' },
  { outKey: 'wind_speed_gust', inKey: 'fx', type: 'normal' },
]

export default {
  id: 'geosphere.at_nowcast-v1-15min-1km',
  name: 'INCA',
  label: 'Nowcast',
  url: 'https://data.hub.geosphere.at/dataset/nowcast-v1-15min-1km',
  parameters: getForecastParametersFromConfig(configs),
  offset: Duration.fromObject({ minutes: 30 }),
  interval: Duration.fromObject({ minutes: 15 }),
  timespan: Duration.fromObject({ minutes: 195 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [8.098, 45.502],
          [17.742, 45.502],
          [17.742, 49.478],
          [8.098, 49.478],
          [8.098, 45.502],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 1000,
} as const satisfies Dataset
