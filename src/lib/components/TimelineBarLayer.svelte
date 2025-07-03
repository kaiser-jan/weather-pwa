<script lang="ts">
  import { interpolateColor } from '$lib/utils/ui'
  import type { Coordinates, TimeSeries } from '$lib/types/data'
  import { CONFIG } from '$lib/config'
  import { DateTime, Duration } from 'luxon'

  interface Props {
    parameter: string
    series: TimeSeries<number>
    style: 'gradient' | 'blocks'
    startDatetime: DateTime
    endDatetime: DateTime
    coordinates?: Coordinates
    barHeight: number
    distanceFromDatetimes: (d: DateTime, d1?: DateTime) => number | undefined
  }

  let {
    //
    parameter,
    series,
    style,
    startDatetime,
    endDatetime,
    coordinates,
    barHeight,
    distanceFromDatetimes,
  }: Props = $props()

  let firstDatetime = $derived(series[0].datetime)
  let lastDatetime = $derived(series[series.length - 1].datetime)
  let lastDatetimeEnd = $derived(lastDatetime?.plus(series[series.length - 1].duration))

  const COLOR_ERROR = 'hsla(0, 100%, 50%, 0%)'

  function getDetailsForValue(value: number): { color: string; size?: string } {
    if (value === undefined) {
      if (parameter === 'uvi_clear_sky') return { color: 'hsl(55, 65%, 65%)' }
      return { color: COLOR_ERROR }
    }

    switch (parameter) {
      case 'temperature':
        return { color: interpolateColor(CONFIG.appearance.colors.temperatureColorStops, value) }
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
    colorCallback: (datetime: DateTime) => string,
    interval = Duration.fromObject({ hour: 1 }),
  ) {
    const gradientStops = []
    let cursor = startDatetime

    while (cursor < endDatetime) {
      gradientStops.push(`${colorCallback(cursor)} ${distanceFromDatetimes(cursor)}%`)
      cursor = cursor.plus(interval)
    }
    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function createTimelineGradient(): string {
    if (parameter === 'sun') return createDatalessGradient((d) => getSunlightColor(d, coordinates))
    if (parameter === 'moon') return createDatalessGradient((d) => getMoonlightColor(d, coordinates))

    if (series.length === 0) return ''

    const gradientStops = series.map(
      (timePeriod) => `${getDetailsForValue(timePeriod.value).color} ${distanceFromDatetimes(timePeriod.datetime)}%`,
    )

    if (startDatetime) {
      gradientStops.unshift(`${COLOR_ERROR} 0%`)
      gradientStops.unshift(`${COLOR_ERROR} ${distanceFromDatetimes(series[0].datetime)}%`)
    }

    console.log(gradientStops)

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  function getBlocksForSeries() {
    if (series.length === 0) return []
    return series.map((value) => ({
      position: distanceFromDatetimes(value.datetime),
      ...getDetailsForValue(value.value),
    }))
  }

  function getWidthForSeriesItem(i: number) {
    const seriesEndDatetime = series[i].datetime.plus(series[i].duration)
    const limitedSeriesEndDatetime = seriesEndDatetime > endDatetime ? endDatetime : seriesEndDatetime
    const percentage = distanceFromDatetimes(limitedSeriesEndDatetime, series[i].datetime)
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
  const moonColor = (factor: number) => `hsla(260, 90%, 80%, ${factor * 100}%)`

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
</script>

{#if style === 'gradient'}
  <div class={[parameter, 'absolute inset-0']} style={createTimelineGradient()}></div>
{:else if style === 'blocks'}
  <div class={[parameter, 'absolute inset-0 flex flex-row justify-end']}>
    <div style={`width: ${distanceFromDatetimes(firstDatetime, startDatetime)}%;`}></div>
    {#each getBlocksForSeries().entries() as [i, stop]}
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
    <div style={`width: ${distanceFromDatetimes(endDatetime, lastDatetimeEnd)}%`}></div>
  </div>
{/if}
