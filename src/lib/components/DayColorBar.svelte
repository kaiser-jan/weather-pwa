<script lang="ts">
  import { interpolateColor } from '$lib/scripts/ui'
  import type { ForecastHour, ForecastInstant, StatisticalNumberSummary } from '$lib/types/data'
  import { CONFIG } from '$lib/scripts/config'
  import { cn } from '$lib/utils'

  type Parameter = keyof Pick<ForecastInstant, 'temperature' | 'cloud_coverage' | 'precipitation_amount'>

  interface Props {
    hourly: ForecastHour[]
    parameters: Parameter[]
    className: string
  }

  const { hourly, className, parameters }: Props = $props()

  function getColorFor(parameter: Parameter, hour: ForecastHour) {
    const value = hour[parameter]
    console.log(parameter, value)
    if (value === undefined) return 'hsl(0, 100%, 50%)'
    switch (parameter) {
      case 'temperature':
        return interpolateColor(CONFIG.appearance.colors.temperatureColorStops, value)
      case 'cloud_coverage':
        return `hsla(0, 0%, 70%, ${value * 100}%)`
      case 'precipitation_amount':
        // https://en.wikipedia.org/wiki/Precipitation_types#Intensity
        return `hsla(215, 66%, 60%, ${(value / 7.6) * 100}%)`
      default:
        return 'hsl(0, 100%, 50%)'
    }
  }

  function createHourlyGradientFor(parameter: Parameter): string {
    if (hourly.length === 0) return ''

    const gradientStops = hourly.map((hour, i) => {
      const color = getColorFor(parameter, hour)
      const pos = (i / (hourly.length - 1)) * 100
      return `${color} ${pos}%`
    })

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }
</script>

<div class={cn('bg-background relative h-full w-full overflow-hidden rounded-full', className)}>
  {#each parameters as parameter}
    <div class="absolute inset-0" style={createHourlyGradientFor(parameter)}></div>
  {/each}
</div>
