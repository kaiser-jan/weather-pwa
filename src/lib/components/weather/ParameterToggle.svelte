<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { ColorStop, MetricDetails, ParameterDaySummaryProps } from '$lib/types/ui'
  import { METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
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

    let categoryColorStops: ColorStop[] | null = null
    if ('categoriesSetting' in details.color) {
      categoryColorStops = settings.readSetting(details.color.categoriesSetting).value as ColorStop[]
    } else if ('categories' in details.color) {
      categoryColorStops = details.color.categories
    } else if ('css' in details.color) {
      return `background-color: ${details.color.css}`
    }

    if (categoryColorStops) {
      const min = details.domainDefault?.min ?? details.domain.min[0]
      const max = details.domainDefault?.max ?? details.domain.max[details.domain.max.length - 1]
      return generateCssRangeGradient(min, max, categoryColorStops, 'top')
    }

    return ''
  })
</script>

<button
  class={cn(
    'bg-background relative flex h-fit grow flex-row items-center gap-2 overflow-hidden rounded-lg border-2 py-2 pr-2.5 pl-3.5',
    isVisible ? 'bg-midground border-midground' : '',
    className,
  )}
  onclick={() => {
    if (!visibleList) return
    visibleList = toggle(visibleList, metric)
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
