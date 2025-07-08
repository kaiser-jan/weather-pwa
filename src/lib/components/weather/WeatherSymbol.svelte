<script lang="ts">
  import { CONFIG } from '$lib/config'
  import { getWeatherIcon, type WeatherSituation } from '$lib/data/symbols'
  import type { Coordinates } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { DateTime } from 'luxon'
  import SunCalc from 'suncalc'

  interface Props {
    derived: WeatherSituation
    provided?: WeatherSituation
    coordinates: Coordinates | undefined
    className: string
  }

  let { derived: derivedSituation, provided: providedSituation, coordinates, className }: Props = $props()

  let icon = $derived.by(() => {
    let weatherSitutation =
      (CONFIG.weather.preferDerivedSymbols ? derivedSituation : providedSituation) ?? derivedSituation

    const now = DateTime.now()
    let isDay = now > DateTime.fromObject({ hour: 6 }) && now < DateTime.fromObject({ hour: 20 })

    if (coordinates) {
      const times = SunCalc.getTimes(now.toJSDate(), coordinates.latitude, coordinates.longitude)
      isDay = now >= DateTime.fromJSDate(times.sunrise) && now <= DateTime.fromJSDate(times.sunset)
    }

    let iconName = getWeatherIcon({ ...weatherSitutation, timeOfDay: isDay ? 'day' : 'night' })

    let iconPath = `/weather-symbols/${CONFIG.appearance.symbols}/${iconName}.svg`

    return { name: iconName, path: iconPath }
  })
</script>

<img class={cn(className)} src={icon.path} alt={icon.name} />
