import { Duration } from 'luxon'

// NOTE: every 3 hours a new forecast is available, with a reftime 4 hours before the release
export const MODEL_REFTIME_OFFSET = Duration.fromObject({ hours: 4 })
export const MODEL_INTERVAL = Duration.fromObject({ hours: 3 })

// https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m/metadata
const WEATHER_PARAMETERS = [
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

type WeatherParameter = (typeof WEATHER_PARAMETERS)[number]

export const REQUESTED_WEATHER_PARAMETERS: WeatherParameter[] = [
  // 'cape',
  // 'cin',
  // 'grad',
  // 'mnt2m',
  // 'mxt2m',
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
] as const
export type RequestedWeatherParameter = (typeof REQUESTED_WEATHER_PARAMETERS)[number]
