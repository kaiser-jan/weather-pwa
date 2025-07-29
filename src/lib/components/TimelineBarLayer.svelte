<script lang="ts">
  import { interpolateColor } from '$lib/utils/ui'
  import type { Coordinates, TimeSeries } from '$lib/types/data'
  import { settings } from '$lib/settings/store'
  import { DateTime, Duration } from 'luxon'

  interface Props {
    parameter: string
    series: TimeSeries<number>
    style: 'gradient' | 'blocks'
    startTimestamp: number
    endTimestamp: number
    coordinates: Coordinates | null
    barHeight: number
    distanceFromDatetimes: (t: number, t1?: number) => number | undefined
  }

  let {
    //
    parameter,
    series,
    style,
    startTimestamp,
    endTimestamp,
    coordinates,
    barHeight,
    distanceFromDatetimes: distanceFromTimestamps,
  }: Props = $props()

  let firstTimestamp = $derived(series[0].timestamp)
  let lastTimestamp = $derived(series[series.length - 1].timestamp)
  let lastEndTimestamp = $derived(lastTimestamp + series[series.length - 1].duration)

  const COLOR_ERROR = 'hsla(0, 100%, 50%, 0%)'

  function getDetailsForValue(value: number): { color: string; size?: string } {
    if (value === undefined) {
      if (parameter === 'uvi_clear_sky') return { color: 'hsl(55, 65%, 65%)' }
      return { color: COLOR_ERROR }
    }

    switch (parameter) {
      case 'temperature':
        return { color: interpolateColor($settings.appearance.colors.temperatureColorStops, value) }
      case 'cloud_coverage':
        return { color: `hsla(0, 0%, 70%, ${value}%)` }
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

  function createDatalessGradient(
    colorCallback: (datetime: number) => string,
    interval = Duration.fromObject({ hour: 1 }),
  ) {
    const gradientStops = []
    let cursor = startTimestamp

    while (cursor < endTimestamp) {
      gradientStops.push(`${colorCallback(cursor)} ${distanceFromTimestamps(cursor)}%`)
      cursor = cursor + interval.toMillis()
    }
    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function createTimelineGradient(): string {
    if (parameter === 'sun') return createDatalessGradient((d) => getSunlightColor(d, coordinates))
    if (parameter === 'moon') return createDatalessGradient((d) => getMoonlightColor(d, coordinates))

    if (series.length === 0) return ''

    const gradientStops = series.map(
      (timePeriod) => `${getDetailsForValue(timePeriod.value).color} ${distanceFromTimestamps(timePeriod.timestamp)}%`,
    )

    if (startTimestamp) {
      gradientStops.unshift(`${COLOR_ERROR} 0%`)
      gradientStops.unshift(`${COLOR_ERROR} ${distanceFromTimestamps(series[0].timestamp)}%`)
    }

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function getBlocksForSeries() {
    if (series.length === 0) return []
    return series.map((value) => ({
      position: distanceFromTimestamps(value.timestamp),
      ...getDetailsForValue(value.value),
    }))
  }

  function getWidthForSeriesItem(i: number) {
    const seriesEndDatetime = series[i].timestamp + series[i].duration
    const limitedSeriesEndDatetime = seriesEndDatetime > endTimestamp ? endTimestamp : seriesEndDatetime
    const percentage = distanceFromTimestamps(limitedSeriesEndDatetime, series[i].timestamp)
    return percentage + '%'
  }

  // https://en.wikipedia.org/wiki/Precipitation_types#Intensity
  // TODO: extract to config
  // TODO: create a playground for adapting the colors
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
  const moonColor = (factor: number) => `hsla(260, 90%, 80%, ${factor * 100}%)`

  export function getSunlightColor(timestamp: number, coordinates?: Coordinates | null): string {
    if (!coordinates) return sunColor(1)
    const position = SunCalc.getPosition(new Date(timestamp), coordinates.latitude, coordinates.longitude)
    const value = Math.max(0, Math.sin(position.altitude)) // altitude is in radians
    return sunColor(value)
  }

  export function getMoonlightColor(timestamp: number, coordinates?: Coordinates | null): string {
    if (!coordinates) return moonColor(1)
    const position = SunCalc.getMoonPosition(new Date(timestamp), coordinates.latitude, coordinates.longitude)
    const illumination = SunCalc.getMoonIllumination(new Date(timestamp))
    const positionFactor = Math.max(0, Math.sin(position.altitude)) // altitude is in radians
    const illuminationFactor = illumination.fraction / 2 + 0.5
    const value = positionFactor * illuminationFactor
    return moonColor(value)
  }
</script>

{#if style === 'gradient'}
  <div class={[parameter, 'absolute inset-0']} style={createTimelineGradient()}></div>
{:else if style === 'blocks'}
  <div class={[parameter, 'absolute inset-0 flex flex-row justify-end']}>
    <div style={`width: ${distanceFromTimestamps(firstTimestamp, startTimestamp)}%;`}></div>
    {#each getBlocksForSeries().entries() as [i, stop] (i)}
      <div class={`flex h-full items-end justify-center ${i}`} style={`width: ${getWidthForSeriesItem(i)};`}>
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
    <div style={`width: ${distanceFromTimestamps(endTimestamp, lastEndTimestamp)}%`}></div>
  </div>
{/if}
