<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { WeatherMetricKey } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { getPreferredUnit, autoFormatMetric } from '$lib/utils/units'
  import MathFraction from './MathFraction.svelte'

  interface Props {
    value: number
    parameter: WeatherMetricKey
    class?: string
  }

  let { value, parameter, class: className }: Props = $props()

  const unit = $derived(getPreferredUnit(parameter, $settings))

  const formattedValue = $derived.by(() => {
    return autoFormatMetric(value, parameter, $settings, { hideUnit: true })
  })
</script>

<span class={cn('inline-flex items-end gap-0.5', className)}>
  <span>{formattedValue}</span>
  {#if unit?.match(/\w\/\w/)}
    <MathFraction numerator={unit.split('/')[0]} denominator={unit.split('/')[1]} />
  {:else}
    <span class="text-text-muted mb-0.5 text-xs">{unit}</span>
  {/if}
</span>
