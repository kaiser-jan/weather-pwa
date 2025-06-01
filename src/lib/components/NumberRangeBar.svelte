<script lang="ts">
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import type { StatisticalNumberSummary } from '$lib/types/data'
  import { CONFIG } from '$lib/config'
  import { cn } from '$lib/utils'

  interface Props {
    total: Pick<StatisticalNumberSummary, 'min' | 'max'>
    instance: StatisticalNumberSummary
    color: 'clouds' | 'temperature'
    className: string
  }

  const { total, instance, color, className }: Props = $props()

  const left = $derived(scale(instance.min))
  const right = $derived(100 - scale(instance.max))
  const gradientCss = $derived(
    generateCssRangeGradient(instance.min, instance.max, CONFIG.appearance.colors.temperatureColorStops),
  )

  function scale(temperature: number) {
    return ((temperature - total.min) / (total.max - total.min)) * 100
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

<div class={cn('bg-foreground relative h-full w-full rounded-full', className)}>
  <span
    class={['absolute inset-0 h-full min-w-1 rounded-full', `left-[${left}%] right-[${right}%]`, backgroundColor]}
    style={[`left: ${left}%; right: ${right}%;`, color === 'temperature' && gradientCss]
      .filter((v) => v !== false)
      .join('')}
  ></span>
</div>
