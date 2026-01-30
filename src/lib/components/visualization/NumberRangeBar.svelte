<script lang="ts">
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import type { NumberSummary } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import type { CategoryColor, MetricDetails } from '$lib/types/ui'

  interface Props {
    domain?: { min: number; max: number }
    total?: NumberSummary
    instance: NumberSummary
    details: MetricDetails
    class: string | (string | undefined | false)[]
    vertical?: boolean
  }

  const { domain: _domain, total, instance, details, class: className, vertical }: Props = $props()

  const startAverage = $derived(scale(instance.avg))

  const domain = $derived(
    _domain ?? {
      min: total?.min ?? instance.min,
      max: total?.max ?? instance.max,
    },
  )

  function scale(temperature: number) {
    return ((temperature - domain.min) / (domain.max - domain.min)) * 100
  }

  function getColorCssFor({ min, max }: { min: number; max: number }) {
    if ('css' in details.color) return `background-color: ${details.color.css};`
    else if (details.categories && details.color.type)
      return generateCssRangeGradient(min, max, details.categories as CategoryColor[], vertical ? 'top' : 'right')
    else return 'background-color: red;'
  }

  function getInsetCssFor({ min, max }: { min: number; max: number }) {
    const startScaled = scale(min)
    const endScaled = 100 - scale(max)

    return vertical ? `top: ${endScaled}%; bottom: ${startScaled}%;` : `left: ${startScaled}%; right: ${endScaled}%;`
  }
</script>

<div class={cn('relative h-full w-full overflow-hidden rounded-full bg-foreground', className)}>
  <div
    class="absolute inset-0 rounded-full opacity-10 mix-blend-color"
    style={[getInsetCssFor(domain), getColorCssFor(domain)].join(' ')}
  ></div>
  {#if total}
    <div
      class="absolute inset-0 rounded-full opacity-30"
      style={[getInsetCssFor(total), getColorCssFor(total)].join(' ')}
    ></div>
  {/if}
  <div
    class="absolute inset-0 rounded-full"
    style={[getColorCssFor(instance), getInsetCssFor(instance)].join(' ')}
  ></div>
  <span
    class={[
      'absolute h-1 w-1 rounded-full bg-background opacity-50',
      vertical ? `left-1/2 -translate-1/2` : 'top-1/2 -translate-1/2',
    ]}
    style={vertical ? `bottom: ${startAverage}%;` : `left: ${startAverage}%;`}
  ></span>
</div>
