export interface Coordinates {
  latitude: number
  longitude: number
  altitude: number
}

export interface Forecast {
  current: ForecastHour
  hourly: ForecastHour[]
  daily: ForecastDay[]
  total: ForecastDay
}

export type StatisticalNumberSummary = { min: number; avg: number; max: number; sum: number }
export type ForecastHour = ForecastInstant<number | undefined>
export type ForecastDay = ForecastInstant<StatisticalNumberSummary>

interface ForecastInstant<NumberT> {
  datetime: Date
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
  precipitation_amount: NumberT
  precipitation_probability: NumberT
  thunder_probability: NumberT
  // can be calculated
  // temperature_dew_point: number
}
