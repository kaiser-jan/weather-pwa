<script lang="ts">
  import { categorizeValue, getMetricDetails, METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { settings } from '$lib/stores/settings'
  import { cn } from '$lib/utils'
  import { getPreferredUnit, autoFormatMetric } from '$lib/utils/units'
  import MathFraction from './MathFraction.svelte'

  interface Props {
    value: number
    parameter: ForecastMetric
    class?: string
    detailed?: boolean
    hideUnit?: boolean
  }

  let { value, parameter, hideUnit, detailed, class: className }: Props = $props()

  const unit = $derived(getPreferredUnit(parameter, $settings))

  const details = $derived(getMetricDetails(parameter))

  const useCategoryLabel = $derived(details.preferCategoryLabel && !detailed)

  const formattedValue = $derived.by(() => {
    if (useCategoryLabel) return categorizeValue(details, value)?.description
    return autoFormatMetric(value, parameter, $settings, { hideUnit: true })
  })
</script>

<span class={cn('inline-flex items-end gap-0.5', className)}>
  <span>{formattedValue}</span>
  {#if !useCategoryLabel && !hideUnit}
    {#if unit?.match(/\w\/\w/)}
      <MathFraction numerator={unit.split('/')[0]} denominator={unit.split('/')[1]} />
    {:else}
      <span class="mb-0.5 text-xs text-text-muted">{unit}</span>
    {/if}
  {/if}
</span>
