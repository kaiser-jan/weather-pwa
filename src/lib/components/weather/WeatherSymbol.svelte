<script lang="ts">
  import { CONFIG } from '$lib/scripts/config'
  import { getWeatherIcon, type WeatherSituation } from '$lib/scripts/data/forecast/providers/symbols'
  import type { Coordinates } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { DateTime } from 'luxon'
  import SunCalc from 'suncalc'
  import { onMount } from 'svelte'

  interface Props {
    derived: WeatherSituation
    provided?: WeatherSituation
    coordinates: Coordinates
    className: string
  }

  let { derived: derivedSituation, provided: providedSituation, coordinates, className }: Props = $props()

  let icon = $derived.by(() => {
    let weatherSitutation =
      (CONFIG.weather.preferDerivedSymbols ? derivedSituation : providedSituation) ?? derivedSituation

    const now = DateTime.now()
    const times = SunCalc.getTimes(now.toJSDate(), coordinates.latitude, coordinates.longitude)
    const isDay = now >= DateTime.fromJSDate(times.sunrise) && now <= DateTime.fromJSDate(times.sunset)

    let iconName = getWeatherIcon({ ...weatherSitutation, timeOfDay: isDay ? 'day' : 'night' })

    let iconPath = `/weather-symbols/${CONFIG.appearance.symbols}/${iconName}.svg`

    return { name: iconName, path: iconPath }
  })
</script>

<img class={cn(className)} src={icon.path} alt={icon.name} />
