import type { WeatherSituation } from '$lib/data/symbols'
import type { DateTime, Duration } from 'luxon'

export interface Coordinates {
  longitude: number
  latitude: number
  altitude: number | null
}

export type NumberSummary = { min: number; avg: number; max: number; sum: number }

export interface Forecast {
  current: WeatherInstant & { symbol?: WeatherSituation }
  multiseries: MultivariateTimeSeries
  daily: (TimeBucketSummary & {
    multiseries: MultivariateTimeSeries
  })[]
  total: TimeBucketSummary
}

export interface TimePeriod {
  datetime: DateTime
  duration: Duration
}

export type WeatherInstant = Partial<Record<WeatherMetricKey, number>>

export type MultivariateTimeSeries = Partial<Record<WeatherMetricKey, TimeSeries<number>>>
export type MultivariateTimeSeriesTimeBucket = TimePeriod & { series: MultivariateTimeSeries }

// TODO: conider uing number values for datetime and duration as those have a considerable performance impact
export type TimeSeries<T> = (TimePeriod & { value: T })[]
export type TimeSeriesNumberEntry = TimeSeries<number>[number]

export type TimeBucketSummary = TimePeriod & { summary: Record<WeatherMetricKey, NumberSummary> }

export const WEATHER_METRIC_KEYS = [
  'temperature',
  'temperature_min',
  'temperature_max',
  'temperature_feel',
  'pressure',
  'relative_humidity',
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

export type WeatherMetricKey = (typeof WEATHER_METRIC_KEYS)[number]

export interface DataProvider {
  load: (coordinates: Coordinates) => Promise<Partial<Forecast>>
}
