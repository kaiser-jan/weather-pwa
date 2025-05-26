<script lang="ts">
  import { interpolateColor } from '$lib/scripts/ui'
  import type { ForecastHour, ForecastInstant, StatisticalNumberSummary } from '$lib/types/data'
  import { CONFIG } from '$lib/scripts/config'
  import { cn } from '$lib/utils'
  import { DateTime, Duration, Interval } from 'luxon'

  type Parameter = keyof Pick<ForecastInstant, 'temperature' | 'cloud_coverage' | 'precipitation_amount'> | 'sun'

  interface Props {
    hourly: ForecastHour[]
    parameters: Parameter[]
    startDatetime?: Date
    endDatetime?: Date
    interval?: Duration
    className: string
  }

  let {
    hourly,
    parameters,
    startDatetime,
    endDatetime,
    interval = Duration.fromObject({ hour: 1 }),
    className,
  }: Props = $props()

  let firstDatetime = $derived(hourly?.[0]?.datetime)
  let lastDatetime = $derived(hourly?.[hourly.length - 1]?.datetime)

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

  function distanceFromDatetime(
    d: Date,
    d1: Date = startDatetime ?? firstDatetime,
    start: Date = startDatetime ?? firstDatetime,
    end = endDatetime ? DateTime.fromJSDate(endDatetime).minus(interval).toJSDate() : lastDatetime,
  ) {
    if (!d || !d1 || !start || !end) return
    return ((d.getTime() - d1.getTime()) / (end.getTime() - start.getTime())) * 100
  }

  function createHourlyGradientFor(parameter: Parameter): string {
    if (hourly.length === 0) return ''

    const gradientStops = hourly.map(
      (hour) => `${getColorFor(parameter, hour)} ${distanceFromDatetime(hour.datetime)}%`,
    )

    if (startDatetime) {
      gradientStops.unshift(`hsla(0, 0%, 0%, 0%) 0%`)
      gradientStops.unshift(`hsla(0, 0%, 0%, 0%) ${distanceFromDatetime(hourly[0].datetime)}%`)
    }

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function createHourlyColorsFor(parameter: Parameter) {
    if (hourly.length === 0) return []

    return hourly.map((hour) => ({
      color: getColorFor(parameter, hour),
      position: distanceFromDatetime(hour.datetime),
    }))
  }

  // https://en.wikipedia.org/wiki/Precipitation_types#Intensity
  // TODO: extract to config
  // TODO: create a test scale for adapting the colors
  const rainCategories: {
    threshold: number // mm
    color: string // hsla
    description: string
  }[] = [
    { threshold: -1, color: 'hsla(0, 0%, 0%, 0)', description: 'No Rain' },
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
  {#if startDatetime}
    <div
      class="bg-foreground absolute top-0 bottom-0 left-0 z-10"
      style={`width: ${distanceFromDatetime(firstDatetime)}%`}
    ></div>
  {/if}
  {#if endDatetime}
    <div
      class="bg-foreground absolute top-0 right-0 bottom-0 z-10"
      style={`width: ${100 - (distanceFromDatetime(lastDatetime) ?? 0)}%`}
    ></div>
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
        <div style={`width: ${distanceFromDatetime(startDatetime ?? firstDatetime, firstDatetime)}%`}></div>
        {#each createHourlyColorsFor(parameter).entries() as [i, stop]}
          <div
            class={`h-full ${i}`}
            style={`background-color: ${stop.color}; width: ${distanceFromDatetime(hourly[i + 1]?.datetime ?? DateTime.fromJSDate(hourly[i].datetime).plus(interval).toJSDate(), hourly[i].datetime)}%`}
          ></div>
        {/each}
        <div
          style={`width: ${distanceFromDatetime(endDatetime ? DateTime.fromJSDate(endDatetime).minus(interval).toJSDate() : lastDatetime, lastDatetime)}%`}
        ></div>
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
      hsl(220, 25%, 12%) 5px,
      hsl(220, 25%, 12%) 10px
    );
  }
</style>
