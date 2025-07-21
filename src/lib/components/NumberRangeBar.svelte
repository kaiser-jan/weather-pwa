<script lang="ts">
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import type { NumberSummary } from '$lib/types/data'
  import { settings } from '$lib/settings/store'
  import { cn } from '$lib/utils'

  interface Props {
    total: Pick<NumberSummary, 'min' | 'max'> | undefined
    instance: NumberSummary
    // TODO: rework color prop
    color: 'clouds' | 'temperature' | string
    className: string
    vertical?: boolean
  }

  const { total = { min: 0, max: 1 }, instance, color, className, vertical }: Props = $props()

  const start = $derived(scale(instance.min))
  const end = $derived(100 - scale(instance.max))
  const startAverage = $derived(scale(instance.avg))
  const gradientCss = $derived(
    generateCssRangeGradient(
      instance.min,
      instance.max,
      $settings.appearance.colors.temperatureColorStops,
      vertical ? 'top' : 'right',
    ),
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
        return color
    }
  })

  const insetStyle = $derived(vertical ? `top: ${end}%; bottom: ${start}%;` : `left: ${start}%; right: ${end}%;`)
</script>

<div class={cn('bg-foreground relative h-full w-full rounded-full', className)}>
  <span
    class={['absolute inset-0 rounded-full', backgroundColor]}
    style={[insetStyle, color === 'temperature' && gradientCss].filter((v) => v !== false).join('')}
  ></span>
  <span
    class={[
      'bg-background absolute h-1 w-1 rounded-full opacity-50',
      vertical ? `left-1/2 -translate-1/2` : 'top-1/2 -translate-1/2',
    ]}
    style={vertical ? `bottom: ${startAverage}%;` : `left: ${startAverage}%;`}
  ></span>
</div>
