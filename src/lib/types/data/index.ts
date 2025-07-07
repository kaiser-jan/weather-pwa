import type { WeatherSituation } from '$lib/data/providers/symbols'
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
  daily: TimeBucketSummary[]
  total: TimeBucketSummary
}

export interface TimePeriod {
  datetime: DateTime
  duration: Duration
}

export type WeatherInstant = Partial<Record<WeatherMetricKey, number>>

export type MultivariateTimeSeries = Partial<Record<WeatherMetricKey, TimeSeries<number>>>
export type MultivariateTimeSeriesTimeBucket = TimePeriod & { series: MultivariateTimeSeries }

export type TimeSeries<T> = (TimePeriod & { value: T })[]
export type TimeSeriesNumberEntry = TimeSeries<number>[number]

export type TimeBucketSummary = TimePeriod & { summary: Record<WeatherMetricKey, NumberSummary> }

export type WeatherMetricKey =
  | 'temperature'
  | 'temperature_min'
  | 'temperature_max'
  | 'temperature_feel'
  | 'pressure'
  | 'relative_humidity'
  | 'uvi_clear_sky'
  | 'cloud_coverage'
  | 'cloud_coverage_low'
  | 'cloud_coverage_medium'
  | 'cloud_coverage_high'
  | 'fog'
  | 'visibility'
  | 'wind_speed'
  | 'wind_speed_gust'
  | 'wind_degrees'
  | 'precipitation_amount'
  | 'precipitation_probability'
  | 'thunder_probability'
  | 'snow_amount' // kg/m2
  | 'cape' // m2/s2 - Convective available potential energy
  | 'cin' // J/kg - Convective inhibition
  | 'grad' // Ws/m2 - Surface global radiation

export interface DataProvider {
  load: (coordinates: Coordinates) => Promise<Partial<Forecast>>
}
