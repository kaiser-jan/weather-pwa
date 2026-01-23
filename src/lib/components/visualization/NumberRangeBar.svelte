<script lang="ts">
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import type { NumberSummary } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import type { CategoryColor, MetricDetails } from '$lib/types/ui'

  interface Props {
    total: Pick<NumberSummary, 'min' | 'max'> | undefined
    instance: NumberSummary
    details: MetricDetails
    className: string
    vertical?: boolean
  }

  const { total = { min: 0, max: 1 }, instance, details, className, vertical }: Props = $props()

  const start = $derived(scale(instance.min))
  const end = $derived(100 - scale(instance.max))
  const startAverage = $derived(scale(instance.avg))

  const colorCss = $derived.by(() => {
    if ('css' in details.color) return `background-color: ${details.color.css}`
    else if (details.categories && details.color.type)
      return generateCssRangeGradient(
        instance.min,
        instance.max,
        details.categories as CategoryColor[],
        vertical ? 'top' : 'right',
      )
    else return 'background-color: red;'
  })

  function scale(temperature: number) {
    return ((temperature - total.min) / (total.max - total.min)) * 100
  }

  const insetStyle = $derived(vertical ? `top: ${end}%; bottom: ${start}%;` : `left: ${start}%; right: ${end}%;`)
</script>

<div class={cn('relative h-full w-full overflow-hidden rounded-full bg-foreground', className)}>
  <span class="absolute inset-0 rounded-full" style={[insetStyle, colorCss].join('')}></span>
  <span
    class={[
      'absolute h-1 w-1 rounded-full bg-background opacity-50',
      vertical ? `left-1/2 -translate-1/2` : 'top-1/2 -translate-1/2',
    ]}
    style={vertical ? `bottom: ${startAverage}%;` : `left: ${startAverage}%;`}
  ></span>
</div>
