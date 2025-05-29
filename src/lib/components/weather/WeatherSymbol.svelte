<script lang="ts">
  import { CONFIG } from '$lib/scripts/config'
  import { getWeatherIcon, type WeatherSituation } from '$lib/scripts/data/forecast/providers/symbols'
  import { cn } from '$lib/utils'

  interface Props {
    derived: WeatherSituation
    provided?: WeatherSituation
    className: string
  }

  let { derived: derivedSituation, provided: providedSituation, className }: Props = $props()

  let icon = $derived.by(() => {
    let weatherSitutation =
      (CONFIG.weather.preferDerivedSymbols ? derivedSituation : providedSituation) ?? derivedSituation
    let iconName = getWeatherIcon(weatherSitutation)
    let iconPath = `/meteocons-fill-static/${iconName}.svg`
    return { name: iconName, path: iconPath }
  })
</script>

<img class={cn(className)} src={icon.path} alt={icon.name} />
