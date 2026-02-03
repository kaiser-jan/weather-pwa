<script lang="ts">
  import { settings } from '$lib/stores/settings'
  import type { CategoryColor, MetricDetails, ParameterDaySummaryProps } from '$lib/types/ui'
  import { METRIC_DETAILS, useCategoriesForColor, type ForecastMetric } from '$lib/config/metrics'
  import { cn, toggle } from '$lib/utils'
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import type { Snippet } from 'svelte'

  type Props = ParameterDaySummaryProps & {
    metric: ForecastMetric
    visibleList?: ForecastMetric[]
    class?: string
    children: Snippet
  }

  let { metric, visibleList = $bindable(), class: className, children }: Props = $props()

  const details = $derived<MetricDetails>(METRIC_DETAILS[metric])

  const isVisible = $derived(visibleList?.includes(metric))

  const colorStyle = $derived.by(() => {
    if (!details?.color) return ''

    let categoryColorStops: CategoryColor[] | null = null
    if (useCategoriesForColor(details)) {
      categoryColorStops = details.categories as CategoryColor[]
    } else if ('css' in details.color) {
      return `background-color: ${details.color.css}`
    }

    if (categoryColorStops) {
      const min = details.domainDefault?.min ?? details.domain.min[0]
      const max = details.domainDefault?.max ?? details.domain.max[0]
      return generateCssRangeGradient(min, max, categoryColorStops, 'top')
    }

    return ''
  })
</script>

<button
  class={cn(
    'relative flex h-fit min-w-[calc(50%-0.25rem)] grow flex-row items-center gap-2 overflow-hidden rounded-lg border-2 bg-background py-2 pr-2.5 pl-3.5 text-base',
    isVisible ? 'border-midground bg-midground' : '',
    className,
  )}
  onclick={() => {
    if (!visibleList) return
    // HACK: copy the array to avoid breaking reactivity
    visibleList = toggle([...visibleList], metric)
  }}
>
  {#if details?.color}
    <div class={`absolute left-0 h-full w-1 ${isVisible ? '' : 'opacity-60'}`} style={colorStyle}></div>

    {#if isVisible && $settings.appearance.accessibility.differentiateWithoutColor}
      <div class={'absolute -top-4 right-0 h-10 w-4 -rotate-45'} style={colorStyle}></div>
    {/if}
  {/if}

  {@render children()}
</button>
