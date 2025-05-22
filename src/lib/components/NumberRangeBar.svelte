<script lang="ts">
  import type { StatisticalNumberSummary } from '$lib/types/data'

  interface Props {
    total: StatisticalNumberSummary
    instance: StatisticalNumberSummary
    color: 'clouds' | 'temperature'
  }

  const { total, instance, color }: Props = $props()

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

  const left = $derived(scale(instance.min))
  const right = $derived(100 - scale(instance.max))
  const gradientCss = $derived(generateGradientCSS(instance.min, instance.max, temperatureColorStops))

  function scale(temperature: number) {
    return ((temperature - total.min) / (total.max - total.min)) * 100
  }

  type ColorStop = { value: number; h: number; s: number; l: number }

  function generateGradientCSS(rangeMin: number, rangeMax: number, stops: ColorStop[]): string {
    const includedStops = stops.filter((s) => s.value >= rangeMin && s.value <= rangeMax)

    const before = [...stops].reverse().find((s) => s.value < rangeMin)
    const after = stops.find((s) => s.value > rangeMax)

    if (before) includedStops.unshift(before)
    if (after) includedStops.push(after)

    const gradientStops = includedStops.map((s) => {
      const pos = ((s.value - rangeMin) / (rangeMax - rangeMin)) * 100
      return `hsl(${s.h}, ${s.s}%, ${s.l}%) ${pos}%`
    })

    return `background: linear-gradient(to right, ${gradientStops.join(', ')});`
  }

  const backgroundColor = $derived.by(() => {
    switch (color) {
      case 'temperature':
        return 'bg-amber-100'
      case 'clouds':
        return 'bg-gray-400'
      default:
        return 'bg-red'
    }
  })
</script>

<div class="bg-foreground relative h-full w-full rounded-full">
  <span
    class={['absolute inset-0 h-full min-w-1 rounded-full', `left-[${left}%] right-[${right}%]`, backgroundColor]}
    style={[`left: ${left}%; right: ${right}%;`, color === 'temperature' && gradientCss]
      .filter((v) => v !== false)
      .join('')}
  ></span>
</div>
