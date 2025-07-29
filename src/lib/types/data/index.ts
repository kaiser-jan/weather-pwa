import type { WeatherSituation } from '$lib/data/symbols'

export interface Coordinates {
  longitude: number
  latitude: number
  altitude: number | null
}

export type NumberSummary = { min: number; avg: number; max: number; sum: number }

export interface Forecast {
  current: (WeatherInstant & { symbol?: WeatherSituation }) | null
  multiseries: MultivariateTimeSeries
  daily: TimeBucket[]
  total: TimeBucketSummary | null
}

export interface TimePeriod {
  /** unix timestamp in milliseconds **/
  timestamp: number
  /** milliseconds **/
  duration: number
}

export type WeatherInstant = Partial<Record<ForecastParameter, number>>

export type MultivariateTimeSeries = Partial<Record<ForecastParameter, TimeSeries<number>>>
export type MultivariateTimeSeriesTimeBucket = TimePeriod & { series: MultivariateTimeSeries }

export type TimeSeries<T> = (TimePeriod & { value: T })[]
export type TimeSeriesNumberEntry = TimeSeries<number>[number]

export type TimeBucketSummary = TimePeriod & { summary: Record<ForecastParameter, NumberSummary> }
export type TimeBucket = TimeBucketSummary & { multiseries: MultivariateTimeSeries }

export const FORECAST_PARAMETERS = [
  'temperature',
  'temperature_min',
  'temperature_max',
  'temperature_feel',
  'pressure',
  'relative_humidity',
  'uvi',
  'uvi_clear_sky',
  'cloud_coverage',
  'fog',
  'visibility',
  'wind_speed',
  'wind_speed_gust',
  'wind_degrees',
  'wind_degrees_gust',
  'precipitation_amount',
  'precipitation_probability',
  'thunder_probability',
  'snow_amount',
  'cape',
  'cin',
  'grad',
] as const

export type ForecastParameter = (typeof FORECAST_PARAMETERS)[number]

export interface DataProvider {
  load: (coordinates: Coordinates) => Promise<Partial<Forecast>>
}
