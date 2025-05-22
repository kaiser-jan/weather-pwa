<script lang="ts">
  import type { ForecastHour, StatisticalNumberSummary } from '$lib/types/data'

  interface Props {
    hourly: ForecastHour[]
  }

  const { hourly }: Props = $props()

  const temperatureColorStops: ColorStop[] = [
    { value: -50, h: 0, s: 100, l: 50 },
    { value: 0, h: 0, s: 0, l: 100 },
    { value: 10, h: 174, s: 49, l: 64 },
    { value: 15, h: 134, s: 47, l: 70 },
    { value: 20, h: 96, s: 67, l: 60 },
    { value: 25, h: 47, s: 83, l: 63 },
    { value: 30, h: 25, s: 56, l: 48 },
    { value: 40, h: 12, s: 66, l: 35 },
  ]

  type ColorStop = { value: number; h: number; s: number; l: number }

  function interpolate(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t
  }

  function interpolateColor(stops: ColorStop[], value: number): string {
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i],
        b = stops[i + 1]
      if (value >= a.value && value <= b.value) {
        const t = (value - a.value) / (b.value - a.value)
        const h = interpolate(a.h, b.h, t)
        const s = interpolate(a.s, b.s, t)
        const l = interpolate(a.l, b.l, t)
        return `hsl(${h}, ${s}%, ${l}%)`
      }
    }
    const edge = value <= stops[0].value ? stops[0] : stops[stops.length - 1]
    return `hsl(${edge.h}, ${edge.s}%, ${edge.l}%)`
  }

  function createHourlyTemperatureGradient(): string {
    if (hourly.length === 0) return ''

    const total = hourly.length - 1

    const gradientStops = hourly.map((h, i) => {
      if (!h.temperature) return 'hsl(0, 100%, 50%)'
      const pos = (i / total) * 100
      const color = interpolateColor(temperatureColorStops, h.temperature)
      return `${color} ${pos}%`
    })

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }
</script>

<div class="bg-foreground relative h-full w-full rounded-full" style={createHourlyTemperatureGradient()}></div>
