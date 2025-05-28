import type { WeatherSituation } from '$lib/scripts/data/forecast/providers/symbols'

export interface Coordinates {
  latitude: number
  longitude: number
  altitude: number
}

export interface Forecast {
  current: ForecastInstant
  hourly: ForecastHour[]
  daily: ForecastDay[]
  total: ForecastTimestep
}

export type StatisticalNumberSummary = { min: number; avg: number; max: number; sum: number }

type ForecastMeta = { datetime: Date }

export type ForecastInstant = ForecastValues<number | undefined>
export type ForecastTimestep = ForecastValues<Partial<StatisticalNumberSummary>>

export type ForecastHour = ForecastMeta & Partial<ForecastInstant>
export type ForecastDay = ForecastMeta & Partial<ForecastTimestep>

interface ForecastValues<NumberT> {
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
  symbol: WeatherSituation
}

export interface DataProvider {
  load: (coordinates: Coordinates) => Promise<{
    current?: ForecastInstant
    hourly?: ForecastHour[]
    daily?: ForecastDay[]
    total?: ForecastTimestep
  }>
}
