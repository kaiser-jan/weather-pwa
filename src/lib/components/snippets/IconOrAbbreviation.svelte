<script lang="ts">
  import type { MetricDetails } from '$lib/types/ui'

  interface Props {
    details: MetricDetails
    showZeroIcon?: boolean
  }

  let { details, showZeroIcon }: Props = $props()

  const ParameterIcon = $derived(showZeroIcon && details.iconIfZero ? details.iconIfZero : details.icon)
</script>

{#if details.icon}
  <ParameterIcon class="shrink-0" />
{:else if details.abbreviation}
  <span class="m-0 shrink-0 text-xs">{details.abbreviation}</span>
{:else}
  {details.label}
{/if}
