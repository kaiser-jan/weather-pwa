import type { ForecastTimePeriodSummary, ForecastValues } from '$lib/types/data'

export type WeatherSituation = {
  precipitation?: 'rain' | 'sleet' | 'snow' | 'hail'
  intensity?: 'drizzle' | 'light' | 'moderate' | 'heavy'
  thunder?: boolean
  fog?: boolean
  mist?: boolean
  haze?: boolean
  dust?: boolean
  smoke?: boolean
  cloudiness?: 'clear' | 'partly' | 'cloudy' | 'overcast'
  timeOfDay?: 'day' | 'night'
}

export function getWeatherIcon(situation: WeatherSituation): string {
  /* time of day specifier */
  const t = situation.timeOfDay ? '-' + situation.timeOfDay : ''
  /* time of day specifier with fallback */
  const tF = '-' + (situation.timeOfDay ?? 'day')

  if (situation.thunder) {
    if (situation.precipitation === 'snow') return `thunderstorms${t}-snow`
    if (situation.precipitation) return `thunderstorms${t}-rain`
    return `thunderstorms${t}`
  }

  if (situation.precipitation) {
    if (situation.cloudiness === 'partly') return `partly-cloudy${tF}-${situation.precipitation}`
    return situation.precipitation
  }

  if (situation.fog) {
    if (situation.cloudiness === 'partly') return `partly-cloudy${tF}-fog`
    return `fog${t}`
  }

  if (situation.mist) return 'mist'
  if (situation.haze) {
    if (situation.cloudiness === 'partly') return `partly-cloudy${tF}-haze`
    return `haze${t}`
  }

  if (situation.cloudiness === 'partly') return `partly-cloudy${tF}`
  if (situation.cloudiness === 'cloudy') return 'cloudy'
  if (situation.cloudiness === 'overcast') return `overcast${t}`

  return `clear${tF}`
}

export function deriveWeatherSituationFromInstant(
  data: Partial<ForecastValues>,
  useSymbolData = true,
): WeatherSituation {
  const situation: WeatherSituation = {}

  if (data.thunder_probability ? data.thunder_probability > 20 : data.symbol?.thunder && useSymbolData)
    situation.thunder = true

  if (data.precipitation_amount) {
    // TODO: rain vs. snow
    situation.precipitation = 'rain'

    // TODO: unite with rain categories
    if (data.precipitation_amount > 5) situation.intensity = 'heavy'
    else if (data.precipitation_amount > 2.5) situation.intensity = 'moderate'
    else if (data.precipitation_amount > 0.2) situation.intensity = 'light'
    else situation.intensity = 'drizzle'
  }

  if (data.fog && data.fog > 20) situation.fog = true

  if (data.cloud_coverage) {
    if (data.cloud_coverage > 0.75) situation.cloudiness = 'overcast'
    else if (data.cloud_coverage > 0.5) situation.cloudiness = 'cloudy'
    else if (data.cloud_coverage > 0.25) situation.cloudiness = 'partly'
    else situation.cloudiness = 'clear'
  }

  return situation
}

// TODO: derive data from symbols
export function deriveWeatherSituationFromPeriod(data: ForecastTimePeriodSummary): WeatherSituation {
  return deriveWeatherSituationFromInstant({
    temperature: data.temperature?.max,
    pressure: data.pressure?.avg,
    relative_humidity: data.relative_humidity?.avg,
    uvi_clear_sky: data.uvi_clear_sky?.max,
    cloud_coverage: data.cloud_coverage?.avg,
    fog: data.fog?.avg,
    wind_speed: data.wind_speed?.max,
    wind_speed_gust: data.wind_speed_gust?.max,
    // TODO: rain vs. snow
    precipitation_amount: data.precipitation_amount?.max,
    precipitation_probability: data.precipitation_amount?.max,
    thunder_probability: data.thunder_probability?.max,
  })
}
