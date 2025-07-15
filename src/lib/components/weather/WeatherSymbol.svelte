<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { getWeatherIcon, type WeatherSituation } from '$lib/data/symbols'
  import type { Coordinates } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { DateTime } from 'luxon'
  import SunCalc from 'suncalc'
  import { Skeleton } from '../ui/skeleton'

  interface Props {
    derived: WeatherSituation | null
    provided?: WeatherSituation | null
    coordinates: Coordinates | undefined
    className: string
  }

  let { derived: derivedSituation, provided: providedSituation, coordinates, className }: Props = $props()

  let loaded = $state(false)

  const settingSymbols = settings.select((s) => s.appearance.symbols)

  let icon = $derived.by(() => {
    let weatherSitutation =
      ($settings.data.forecast.preferDerivedSymbols ? derivedSituation : providedSituation) ?? derivedSituation

    if (!weatherSitutation) return null

    const now = DateTime.now()
    let isDay = now > DateTime.fromObject({ hour: 6 }) && now < DateTime.fromObject({ hour: 20 })

    if (coordinates) {
      const times = SunCalc.getTimes(now.toJSDate(), coordinates.latitude, coordinates.longitude)
      isDay = now >= DateTime.fromJSDate(times.sunrise) && now <= DateTime.fromJSDate(times.sunset)
    }

    let iconName = getWeatherIcon({ ...weatherSitutation, timeOfDay: isDay ? 'day' : 'night' })

    let iconPath = `/weather-symbols/${$settingSymbols}/${iconName}.svg`

    return { name: iconName, path: iconPath }
  })
</script>

<div class={cn(className)}>
  <img src={icon?.path} alt={icon?.name} onload={() => (loaded = true)} />
  {#if !loaded}
    <Skeleton class="size-full" />
  {/if}
</div>
