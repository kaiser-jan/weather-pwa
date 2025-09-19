import type { TimeBucketSummary, WeatherInstant } from '$lib/types/data'

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

/**
 * Determines the weather icon to use for the given weather situation.
 * Evaluates based on custom logic following the perceived importance of events.
 */
export function getWeatherIcon(s: WeatherSituation): string {
  /* time of day specifier */
  const t = s.timeOfDay ? '-' + s.timeOfDay : ''
  /* time of day specifier with fallback */
  const tF = '-' + (s.timeOfDay ?? 'day')

  if (s.thunder) {
    if (s.precipitation === 'snow') return `thunderstorms${t}-snow`
    if (s.precipitation) return `thunderstorms${t}-rain`
    return `thunderstorms${t}`
  }

  if (s.precipitation) {
    const isDrizzle = s.intensity === 'drizzle' && s.precipitation === 'rain'
    const precipitationString = isDrizzle ? ('drizzle' as 'rain') : s.precipitation
    if (s.cloudiness === 'partly') return `partly-cloudy${tF}-${precipitationString}`
    return precipitationString
  }

  if (s.fog) {
    if (s.cloudiness === 'partly') return `partly-cloudy${tF}-fog`
    return `fog${t}`
  }

  if (s.mist) return 'mist'
  if (s.haze) {
    if (s.cloudiness === 'partly') return `partly-cloudy${tF}-haze`
    return `haze${t}`
  }

  if (s.cloudiness === 'partly') return `partly-cloudy${tF}`
  // NOTE: overcast-day looks less cloudy than 'cloudy'
  // TODO: this depends on the icon set
  if (s.cloudiness === 'cloudy') return `overcast${tF}`
  if (s.cloudiness === 'overcast') return `overcast`

  return `clear${tF}`
}

/**
 * Determines
 */
export function deriveWeatherSituationFromInstant(data: Partial<WeatherInstant>): WeatherSituation {
  const situation: WeatherSituation = {}

  if (data.thunder_probability && data.thunder_probability > 20) situation.thunder = true

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
