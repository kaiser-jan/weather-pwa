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
  }

  let { value, parameter, class: className }: Props = $props()

  const unit = $derived(getPreferredUnit(parameter, $settings))

  const formattedValue = $derived.by(() => {
    const details = getMetricDetails(parameter)
    if (details.preferCategoryLabel) return categorizeValue(details, value)?.description
    return autoFormatMetric(value, parameter, $settings, { hideUnit: true })
  })
</script>

<span class={cn('inline-flex items-end gap-0.5', className)}>
  <span>{formattedValue}</span>
  {#if !getMetricDetails(parameter).preferCategoryLabel}
    {#if unit?.match(/\w\/\w/)}
      <MathFraction numerator={unit.split('/')[0]} denominator={unit.split('/')[1]} />
    {:else}
      <span class="mb-0.5 text-xs text-text-muted">{unit}</span>
    {/if}
  {/if}
</span>
