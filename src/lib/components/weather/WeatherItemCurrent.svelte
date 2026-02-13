<script lang="ts">
  import type { Forecast } from '$lib/types/data'
  import { Navigation2Icon } from '@lucide/svelte'
  import FormattedMetric from '$lib/components/snippets/FormattedMetric.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import { categorizeValue, METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'

  interface Props {
    item: ForecastMetric
    current: Forecast['current'] | null
  }

  const { item: parameter, current }: Props = $props()

  const details = $derived(METRIC_DETAILS[parameter])
  const value = $derived(current?.[parameter])
</script>

{#if current && value}
  <span class="inline-flex items-center gap-1.5">
    {#if details}
      <IconOrAbbreviation {details} />
    {/if}

    {#if details.preferCategoryLabel}
      {categorizeValue(details, value)?.description}
    {:else}
      <FormattedMetric {value} {parameter} />
    {/if}

    {#if parameter === 'wind_speed' && current.wind_degrees}
      <Navigation2Icon
        class="size-[0.8em]! text-text-muted"
        style={`transform: rotate(${current.wind_degrees - 180}deg)`}
      />
    {/if}
  </span>
{/if}
