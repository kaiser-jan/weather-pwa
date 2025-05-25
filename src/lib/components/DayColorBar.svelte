<script lang="ts">
  import { interpolateColor } from '$lib/scripts/ui'
  import type { ForecastHour, ForecastInstant, StatisticalNumberSummary } from '$lib/types/data'
  import { CONFIG } from '$lib/scripts/config'
  import { cn } from '$lib/utils'

  type Parameter = keyof Pick<ForecastInstant, 'temperature' | 'cloud_coverage' | 'precipitation_amount'> | 'sun'

  interface Props {
    hourly: ForecastHour[]
    parameters: Parameter[]
    offset: number
    className: string
  }

  let { hourly, parameters, offset = 0, className }: Props = $props()

  const parameterStyleMap: Record<Parameter, 'gradient' | 'blocks'> = {
    cloud_coverage: 'gradient',
    precipitation_amount: 'blocks',
    temperature: 'gradient',
    sun: 'gradient',
  }

  function getColorFor(parameter: Parameter, hour: ForecastHour) {
    // TODO: sun and moon
    if (parameter === 'sun') return 'hsl(55, 65%, 65%)'

    const value = hour[parameter]
    if (value === undefined) return 'hsl(0, 100%, 50%)'

    switch (parameter) {
      case 'temperature':
        return interpolateColor(CONFIG.appearance.colors.temperatureColorStops, value)
      case 'cloud_coverage':
        return `hsla(0, 0%, 70%, ${value * 100}%)`
      case 'precipitation_amount':
        return rainCategories.findLast((c) => value > c.threshold)?.color

      default:
        return 'hsl(0, 100%, 50%)'
    }
  }

  const positionFromIndex = (i: number) => ((i + offset) / (hourly.length + offset)) * 100

  function createHourlyGradientFor(parameter: Parameter): string {
    if (hourly.length === 0) return ''

    const gradientStops = hourly.map((hour, i) => `${getColorFor(parameter, hour)} ${positionFromIndex(i)}%`)

    if (offset > 0) {
      gradientStops.unshift(`hsla(0, 0%, 0%, 0%) 0%`)
      gradientStops.unshift(`hsla(0, 0%, 0%, 0%) ${positionFromIndex(0)}%`)
    }

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function createHourlyColorsFor(parameter: Parameter) {
    if (hourly.length === 0) return []

    return hourly.map((hour, i) => ({
      color: getColorFor(parameter, hour),
      position: positionFromIndex(i),
    }))
  }

  // https://en.wikipedia.org/wiki/Precipitation_types#Intensity
  const rainCategories: {
    threshold: number // mm
    color: string // hsla
    description: string
  }[] = [
    { threshold: 0.01, color: 'hsla(210, 50%, 55%, 0.6)', description: 'Drizzle' },
    { threshold: 0.2, color: 'hsla(210, 50%, 55%, 0.8)', description: 'Light Rain' },
    { threshold: 2.5, color: 'hsla(215, 50%, 55%, 1)', description: 'Moderate Rain' },
    { threshold: 5, color: 'hsla(225, 50%, 40%, 1)', description: 'Heavy Rain' },
    { threshold: 10, color: 'hsla(230, 65%, 32%, 1)', description: 'Very Heavy Rain' },
    { threshold: 20, color: 'hsla(255, 60%, 35%, 1)', description: 'Extreme Rain' },
    { threshold: 50, color: 'hsla(270, 70%, 45%, 1)', description: 'Violent Rain' },
  ]
</script>

<div class={cn('bg-midground relative h-full w-full overflow-hidden rounded-full', className)}>
  {#if offset !== 0}
    <div class="stripe-pattern absolute top-0 bottom-0 left-0" style={`width: ${positionFromIndex(offset)}%`}></div>
  {/if}
  {#each parameters as parameter}
    {#if parameterStyleMap[parameter] === 'gradient'}
      <div class="absolute inset-0" style={createHourlyGradientFor(parameter)}></div>
    {:else}
      <div class="absolute inset-0 flex flex-row justify-end">
        <!-- {#each rainCategories as c} -->
        <!--   <div -->
        <!--     class="w-full" -->
        <!--     style={`background-color: ${c.color}; width: ${100 / (offset + hourly.length) + 0.01}%`} -->
        <!--   ></div> -->
        <!-- {/each} -->
        {#each createHourlyColorsFor(parameter) as stop}
          <div
            class="h-full"
            style={`background-color: ${stop.color}; width: ${100 / (offset + hourly.length) + 0.01}%`}
          ></div>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style lang="postcss">
  .stripe-pattern {
    background-color: var(--color-blue-500);
    background: repeating-linear-gradient(
      45deg,
      hsl(220, 20%, 20%),
      hsl(220, 20%, 20%) 5px,
      transparent 5px,
      transparent 10px
    );
  }
</style>
