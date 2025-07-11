<script lang="ts">
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import type { WeatherMetricKey } from '$lib/types/data'
  import { formatMetric, getPreferredUnit } from '$lib/utils/units'

  interface Props {
    parameter: WeatherMetricKey
    value: number
  }

  let { parameter, value }: Props = $props()

  const details = $derived(CHART_SERIES_DETAILS[parameter]!)
  const showZeroIcon = $derived(value === 0 && details.iconIfZero)
  const ParameterIcon = $derived(showZeroIcon ? details.iconIfZero : details.icon)
</script>

<div class="align-center flex flex-1 flex-row items-center justify-center gap-1 last:mr-1.5">
  <ParameterIcon />
  {#if value === undefined}
    <span>-</span>
  {:else if !showZeroIcon}
    <!-- TODO: proper formatting -->
    <span class="whitespace-nowrap">
      {formatMetric(value, parameter, getPreferredUnit(parameter))}
    </span>
  {/if}
</div>
