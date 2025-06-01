import { Duration } from 'luxon'
import type { GeosphereModelMeta } from '../meta'

// https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m/metadata
const availableParameters = [
  'cape', // Convective available potential energy
  'cin', // Convective inhibition
  'grad', // Surface global radiation
  'mnt2m', // Minimum 2m temperature in the last forecast period
  'mxt2m', // Maximum 2m temperature in the last forecast period
  'rain_acc', // Total rainfall amount
  'rh2m', // Relative humidity 2m above ground
  'rr_acc', // Total precipitation amount
  'snow_acc', // Total surface snow amount
  'snowlmt', // Snow limit
  'sp', // Surface pressure
  'sundur_acc', // Sunshine duration accumulated
  'sy', // Weather symbol
  't2m', // 2m temperature
  'tcc', // Total cloud cover
  'ugust', // U component of maximum wind gust
  'u10m', // 10m wind speed in eastward direction
  'v10m', // 10m wind speed in northward direction
  'vgust', // V component of maximum wind gust
] as const

const meta: GeosphereModelMeta<(typeof availableParameters)[number]> = {
  // NOTE: every 3 hours a new forecast is available, with a reftime 4 hours before the release
  reftimeOffset: Duration.fromObject({ hours: 4 }),
  interval: Duration.fromObject({ hours: 3 }),
  availableParameters,
  maxOffset: 5,
  forecast_length: 61,
  bounding_box: [
    { longitude: 5.498, latitude: 42.981 },
    { longitude: 22.102, latitude: 51.819 },
  ],
  spatial_resolution_m: 2500,
} as const

export default meta
