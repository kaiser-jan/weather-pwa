<script lang="ts">
  import { categorizeValue, getMetricDetails, useCategoriesForColor, type ForecastMetric } from '$lib/config/metrics'
  import { settings } from '$lib/stores/settings'
  import type { CategoryColor } from '$lib/types/ui'
  import { cn } from '$lib/utils'
  import { colorToCss, interpolateColor } from '$lib/utils/color'
  import { getPreferredUnit, autoFormatMetric } from '$lib/utils/units'
  import MathFraction from './MathFraction.svelte'

  interface Props {
    value?: number
    parameter: ForecastMetric
    class?: string
    detailed?: boolean
    hideUnit?: boolean
    accumulated?: boolean
    categoryIndicator?: boolean
    categoryIndicatorAfter?: boolean
  }

  let {
    value,
    parameter,
    hideUnit,
    detailed,
    accumulated,
    categoryIndicator,
    categoryIndicatorAfter,
    class: className,
  }: Props = $props()

  const unit = $derived(getPreferredUnit(parameter, $settings, accumulated))

  const details = $derived(getMetricDetails(parameter))

  const useCategoryLabel = $derived(details.preferCategoryLabel && !detailed)

  const formattedValue = $derived.by(() => {
    if (value === undefined) return undefined
    if (useCategoryLabel) return categorizeValue(details, value)?.description
    return autoFormatMetric(value, parameter, $settings, { hideUnit: true, accumulated })
  })

  const categoryColor = $derived(
    value ? colorToCss(interpolateColor(details.categories as CategoryColor[], value)) : 'transparent',
  )
</script>

{#snippet categoryIndicatorDot()}
  <div class="mr-[0.2em] mb-[0.25em] h-[1em] w-1 rounded-full" style={`background-color: ${categoryColor};`}></div>
{/snippet}

<span class={cn('inline-flex w-fit shrink-0 items-end gap-0.5', className)}>
  {#if useCategoriesForColor(details) && categoryIndicator && !categoryIndicatorAfter}
    {@render categoryIndicatorDot()}
  {/if}
  <span class="text-nowrap">{formattedValue}</span>
  {#if !useCategoryLabel && !hideUnit}
    {#if unit?.match(/\w\/\w/)}
      <MathFraction numerator={unit.split('/')[0]} denominator={unit.split('/')[1]} />
    {:else}
      <span class="mb-[0.175em] text-xs text-text-muted">{unit}</span>
    {/if}
  {/if}
  {#if useCategoriesForColor(details) && categoryIndicator && categoryIndicatorAfter}
    {@render categoryIndicatorDot()}
  {/if}
</span>
