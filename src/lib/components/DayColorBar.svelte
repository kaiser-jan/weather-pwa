<script lang="ts">
  import { interpolateColor } from '$lib/scripts/ui'
  import type { ForecastHour, StatisticalNumberSummary } from '$lib/types/data'
  import { CONFIG } from '$lib/scripts/config'

  interface Props {
    hourly: ForecastHour[]
  }

  const { hourly }: Props = $props()

  function createHourlyTemperatureGradient(): string {
    if (hourly.length === 0) return ''

    const total = hourly.length - 1

    const gradientStops = hourly.map((h, i) => {
      if (!h.temperature) return 'hsl(0, 100%, 50%)'
      const pos = (i / total) * 100
      const color = interpolateColor(CONFIG.appearance.colors.temperatureColorStops, h.temperature)
      return `${color} ${pos}%`
    })

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }
</script>

<div class="bg-foreground relative h-full w-full rounded-full" style={createHourlyTemperatureGradient()}></div>
