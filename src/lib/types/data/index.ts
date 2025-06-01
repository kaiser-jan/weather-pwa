import type { WeatherSituation } from '$lib/data/providers/symbols'
import type { DateTime, Duration } from 'luxon'

export interface Coordinates {
  longitude: number
  latitude: number
  altitude: number | null
}

export interface Forecast {
  current?: ForecastValues
  timePeriods: ForecastTimePeriod[]
  daily: ForecastTimePeriodSummary[]
  total: ForecastValuesSummary
}

export type StatisticalNumberSummary = { min: number; avg: number; max: number; sum: number }

type ForecastMeta = { datetime: DateTime; duration: Duration }

export type ForecastValues = Partial<ForecastValuesOf<number | undefined>>
export type ForecastValuesSummary = Partial<ForecastValuesOf<Partial<StatisticalNumberSummary>>>

export type ForecastTimePeriod = ForecastMeta & ForecastValues
export type ForecastTimePeriodSummary = ForecastMeta & ForecastValuesSummary

interface ForecastValuesOf<NumberT> {
  temperature: NumberT
  temperature_feel?: NumberT
  pressure: NumberT
  relative_humidity: NumberT
  uvi_clear_sky: NumberT
  cloud_coverage: NumberT
  cloud_coverage_low: NumberT
  cloud_coverage_medium: NumberT
  cloud_coverage_high: NumberT
  fog?: NumberT
  visibility?: NumberT
  wind_speed: NumberT
  wind_speed_gust: NumberT
  wind_degrees: NumberT
  // TODO: rain vs. snow
  precipitation_amount: NumberT
  precipitation_probability: NumberT
  thunder_probability: NumberT
  // can be calculated
  // temperature_dew_point: number
  symbol?: WeatherSituation
}

export interface DataProvider {
  load: (coordinates: Coordinates) => Promise<Partial<Forecast>>
}
