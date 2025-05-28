export type WeatherSituation = {
  precipitation?: 'drizzle' | 'rain' | 'sleet' | 'snow' | 'hail'
  intensity?: 'light' | 'moderate' | 'heavy'
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
    return `fog-${t}`
  }

  if (situation.mist) return 'mist'
  if (situation.haze) {
    if (situation.cloudiness === 'partly') return `partly-cloudy${tF}-haze`
    return `haze-${t}`
  }

  if (situation.cloudiness === 'partly') return `partly-cloudy${tF}`
  if (situation.cloudiness === 'cloudy') return 'cloudy'
  if (situation.cloudiness === 'overcast') return `overcast${t}`

  return `clear-${tF}`
}
