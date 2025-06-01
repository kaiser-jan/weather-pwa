import { Duration } from 'luxon'
import type { GeosphereModelMeta } from '../meta'

// Define the available parameters based on the provided metadata
const availableParameters = [
  'dd', // 10m wind direction
  'ff', // 10m wind speed
  'fx', // 10m gust speed
  'pt', // Precipitation type
  'rh2m', // Relative humidity 2m above ground
  'rr', // Precipitation sum
  't2m', // Air temperature 2m above ground
  'td', // Dew point temperature 2m above ground
] as const

const meta: GeosphereModelMeta<(typeof availableParameters)[number]> = {
  reftimeOffset: Duration.fromObject({ minutes: 30 }),
  interval: Duration.fromObject({ minutes: 15 }),
  availableParameters,
  maxOffset: 5,
  forecast_length: 13,
  bounding_box: [
    { longitude: 8.098, latitude: 45.502 },
    { longitude: 17.742, latitude: 49.478 },
  ],
  spatial_resolution_m: 1000,
} as const

export default meta
