<script lang="ts">
  import { interpolateColor } from '$lib/scripts/ui'
  import type { Coordinates, ForecastHour, ForecastInstant, StatisticalNumberSummary } from '$lib/types/data'
  import { CONFIG } from '$lib/scripts/config'
  import { cn } from '$lib/utils'
  import { DateTime, Duration, Interval } from 'luxon'
  import { onDestroy } from 'svelte'

  type Parameter =
    | keyof Pick<
        ForecastInstant,
        'temperature' | 'cloud_coverage' | 'precipitation_amount' | 'wind_speed' | 'uvi_clear_sky'
      >
    | 'sun'
    | 'moon'

  interface Props {
    hourly: ForecastHour[]
    parameters: Parameter[]
    startDatetime?: DateTime
    endDatetime?: DateTime
    interval?: Duration
    marks?: DateTime[]
    coordinates?: Coordinates
    className: string
  }

  let {
    hourly,
    parameters,
    startDatetime,
    endDatetime,
    interval = Duration.fromObject({ hour: 1 }),
    marks = [],
    coordinates,
    className,
  }: Props = $props()

  let firstDatetime = $derived(hourly?.[0]?.datetime)
  let lastDatetime = $derived(hourly?.[hourly.length - 1]?.datetime)
  let lastDatetimeEnd = $derived(lastDatetime?.plus(interval))
  let barHeight = $state<number>(0)

  // TODO: make this configurable in the parameter list
  // style: gradient | color | size
  // color: fluent | steps | constant
  // TODO: consider adding a threshold
  const parameterStyleMap: Record<Parameter, 'gradient' | 'blocks'> = {
    cloud_coverage: 'gradient',
    precipitation_amount: 'blocks',
    temperature: 'gradient',
    sun: 'gradient',
    moon: 'gradient',
    wind_speed: 'blocks',
    uvi_clear_sky: 'gradient',
  }

  const COLOR_ERROR = 'hsla(0, 100%, 50%, 0%)'

  function getDetailsForBlock(parameter: Parameter, hour: ForecastHour): { color: string; size?: string } {
    // TODO: sun and moon
    if (parameter === 'sun') return { color: getSunlightColor(hour.datetime, coordinates) }
    if (parameter === 'moon') return { color: getMoonlightColor(hour.datetime, coordinates) }

    const value = hour[parameter]
    if (value === undefined) {
      if (parameter === 'uvi_clear_sky') return { color: 'hsl(55, 65%, 65%)' }
      return { color: COLOR_ERROR }
    }

    switch (parameter) {
      case 'temperature':
        return { color: interpolateColor(CONFIG.appearance.colors.temperatureColorStops, value) }
      case 'cloud_coverage':
        return { color: `hsla(0, 0%, 70%, ${value * 100}%)` }
      case 'precipitation_amount':
        return { color: RAIN_CATEGORIES.findLast((c) => value > c.threshold)?.color ?? COLOR_ERROR }
      case 'wind_speed':
        // TODO: beaufort wind scale
        return { color: 'hsl(0, 0%, 100%)', size: `${Math.pow(value / 32, 0.75) * barHeight}px` }
      case 'uvi_clear_sky':
        return { color: UVI_COLORS[Math.round(value)] }
      default:
        return { color: COLOR_ERROR }
    }
  }

  function distanceFromDatetime(
    d: DateTime,
    d1: DateTime = startDatetime ?? firstDatetime,
    start: DateTime = startDatetime ?? firstDatetime,
    end = endDatetime ? endDatetime : lastDatetimeEnd,
  ) {
    if (!d || !d1 || !start || !end) return
    return ((d.toUnixInteger() - d1.toUnixInteger()) / (end.toUnixInteger() - start.toUnixInteger())) * 100
  }

  function createHourlyGradientFor(parameter: Parameter): string {
    if (hourly.length === 0) return ''

    const gradientStops = hourly.map(
      (hour) => `${getDetailsForBlock(parameter, hour).color} ${distanceFromDatetime(hour.datetime)}%`,
    )

    if (startDatetime) {
      gradientStops.unshift(`${COLOR_ERROR} 0%`)
      gradientStops.unshift(`${COLOR_ERROR} ${distanceFromDatetime(hourly[0].datetime)}%`)
    }

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function createHourlyBlocksFor(parameter: Parameter) {
    if (hourly.length === 0) return []
    return hourly.map((hour) => ({
      position: distanceFromDatetime(hour.datetime),
      ...getDetailsForBlock(parameter, hour),
    }))
  }

  function getWidthForHour(i: number) {
    const currentHourEndDatetime = hourly[i].datetime.plus(interval)
    const percentage = distanceFromDatetime(hourly[i + 1]?.datetime ?? currentHourEndDatetime, hourly[i].datetime)
    return percentage + '%'
  }

  // https://en.wikipedia.org/wiki/Precipitation_types#Intensity
  // TODO: extract to config
  // TODO: create a test scale for adapting the colors
  const RAIN_CATEGORIES: {
    threshold: number // mm
    color: string // hsla
    description: string
  }[] = [
    { threshold: -1, color: 'hsla(0, 0%, 0%, 0)', description: 'No Rain' },
    { threshold: 0.01, color: 'hsla(210, 50%, 55%, 0.4)', description: 'Drizzle' },
    { threshold: 0.2, color: 'hsla(210, 50%, 55%, 0.7)', description: 'Light Rain' },
    { threshold: 2.5, color: 'hsla(215, 50%, 55%, 1)', description: 'Moderate Rain' },
    { threshold: 5, color: 'hsla(225, 50%, 40%, 1)', description: 'Heavy Rain' },
    { threshold: 10, color: 'hsla(230, 65%, 32%, 1)', description: 'Very Heavy Rain' },
    { threshold: 20, color: 'hsla(255, 60%, 35%, 1)', description: 'Extreme Rain' },
    { threshold: 50, color: 'hsla(270, 70%, 45%, 1)', description: 'Violent Rain' },
  ] as const

  const UVI_COLORS = [
    '#658D1B',
    '#84BD00',
    '#97D700',
    '#F7EA48',
    '#FCE300',
    '#FFCD00',
    '#ECA154',
    '#FF8200',
    '#EF3340',
    '#DA291C',
    '#BF0D3E',
    '#4B1E88',
    '#62359F',
    '#794CB6',
    '#9063CD',
    '#A77AE4',
    '#BE91FB',
    '#D5A8FF',
    '#ECBFFF',
    '#FFD6FF',
    '#FFEDFF',
    '#FFFFFF',
  ] as const

  import SunCalc from 'suncalc'

  const sunColor = (factor: number) => `hsla(55, 65%, 65%, ${factor * 100}%)`
  const moonColor = (factor: number) => `hsla(260, 85%, 85%, ${factor * 100}%)`

  export function getSunlightColor(date: DateTime, coordinates?: Coordinates): string {
    if (!coordinates) return sunColor(1)
    const position = SunCalc.getPosition(date.toJSDate(), coordinates.latitude, coordinates.longitude)
    const value = Math.max(0, Math.sin(position.altitude)) // altitude is in radians
    return sunColor(value)
  }

  export function getMoonlightColor(date: DateTime, coordinates?: Coordinates): string {
    if (!coordinates) return moonColor(1)
    const position = SunCalc.getMoonPosition(date.toJSDate(), coordinates.latitude, coordinates.longitude)
    const illumination = SunCalc.getMoonIllumination(date.toJSDate())
    const positionFactor = Math.max(0, Math.sin(position.altitude)) // altitude is in radians
    const illuminationFactor = illumination.fraction / 2 + 0.5
    const value = positionFactor * illuminationFactor
    return moonColor(value)
  }

  let now = $state(DateTime.now())
  const intervalUpdateCurrentDate = setInterval(() => {
    now = DateTime.now()
  }, 60000)

  onDestroy(() => clearInterval(intervalUpdateCurrentDate))
</script>

<div
  class={cn('bg-foreground relative h-full w-full overflow-hidden rounded-full', className)}
  bind:clientHeight={barHeight}
>
  {#if startDatetime && DateTime.now() > firstDatetime && DateTime.now() < lastDatetimeEnd}
    <div
      class="stripe-pattern absolute top-0 bottom-0 z-100"
      style={`width: ${distanceFromDatetime(now, firstDatetime)}%; left: ${distanceFromDatetime(firstDatetime, startDatetime)}%;`}
    ></div>
  {/if}
  {#each marks as mark}
    <div
      class="bg-foreground absolute -top-1 -bottom-1 z-100 w-[0.05rem] opacity-40"
      style={`left: ${distanceFromDatetime(mark, startDatetime)}%;`}
    ></div>
  {/each}
  {#each parameters as parameter}
    {#if parameterStyleMap[parameter] === 'gradient'}
      <div class={[parameter, 'absolute inset-0']} style={createHourlyGradientFor(parameter)}></div>
    {:else if parameterStyleMap[parameter] === 'blocks'}
      <div class={[parameter, 'absolute inset-0 flex flex-row justify-end']}>
        <div style={`width: ${distanceFromDatetime(startDatetime ?? firstDatetime, firstDatetime)}%`}></div>
        {#each createHourlyBlocksFor(parameter).entries() as [i, stop]}
          <div class={`flex h-full items-end justify-center ${i}`} style={`width: ${getWidthForHour(i)};`}>
            <div
              style={`
                background-color: ${stop.color};
                width: ${stop.size ?? '100%'};
                height: ${stop.size ?? '100%'};
                border-radius: ${stop.size !== undefined ? '100%' : '0'};
              `}
            ></div>
          </div>
        {/each}
        <div style={`width: ${distanceFromDatetime(endDatetime ? endDatetime : lastDatetimeEnd, lastDatetime)}%`}></div>
      </div>
    {/if}
  {/each}
</div>

<style lang="postcss">
  .stripe-pattern {
    background-color: var(--color-blue-500);
    background: repeating-linear-gradient(
      45deg,
      hsla(220, 20%, 20%, 45%),
      hsla(220, 20%, 20%, 45%) 4px,
      hsla(220, 25%, 12%, 70%) 4px,
      hsla(220, 25%, 12%, 70%) 8px
    );
  }
</style>
