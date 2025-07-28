<script lang="ts">
  import { METRIC_DETAILS } from '$lib/metric-config'
  import { settings } from '$lib/settings/store'
  import type { ForecastParameter } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { autoFormatMetric } from '$lib/utils/units'

  interface Props {
    parameter: ForecastParameter
    value: number | undefined
    class?: string
  }

  let { parameter, value, class: className }: Props = $props()

  const details = $derived(METRIC_DETAILS[parameter]!)
  const showZeroIcon = $derived(value === 0 && details.iconIfZero)
  const ParameterIcon = $derived(showZeroIcon ? details.iconIfZero : details.icon)
</script>

<div class={cn('align-center flex flex-1 flex-row items-center justify-center gap-1 last:mr-1.5', className)}>
  <ParameterIcon />
  {#if value === undefined}
    <span>-</span>
  {:else if !showZeroIcon}
    <span class="whitespace-nowrap">
      {autoFormatMetric(value, parameter, $settings)}
    </span>
  {/if}
</div>
