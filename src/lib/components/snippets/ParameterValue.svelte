<script lang="ts">
  import { METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { settings } from '$lib/stores/settings'
  import { cn } from '$lib/utils'
  import { autoFormatMetric } from '$lib/utils/units'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'

  interface Props {
    parameter: ForecastMetric
    value: number | undefined
    class?: string
  }

  let { parameter, value, class: className }: Props = $props()

  const details = $derived(METRIC_DETAILS[parameter]!)
  const showZeroIcon = $derived(value === 0 && details.iconIfZero)
</script>

<div class={cn('align-center flex flex-1 flex-row items-center justify-center gap-1 last:mr-1.5', className)}>
  <IconOrAbbreviation {details} showZeroIcon={value === 0} />
  {#if value === undefined}
    <span>-</span>
  {:else if !showZeroIcon}
    <span class="whitespace-nowrap">
      {autoFormatMetric(value, parameter, $settings)}
    </span>
  {/if}
</div>
