<script lang="ts">
  import type { Forecast, ForecastParameter } from '$lib/types/data'
  import { Navigation2Icon } from '@lucide/svelte'
  import FormattedMetric from '$lib/components/snippets/FormattedMetric.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import { DEW_POINT_CATEGORIES } from '$lib/config/categorization'

  interface Props {
    item: ForecastParameter
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

    {#if parameter === 'dew_point'}
      {DEW_POINT_CATEGORIES.findLast((c) => c.threshold < value)?.description}
    {:else}
      <FormattedMetric {value} {parameter} />
    {/if}

    {#if parameter === 'wind_speed' && current.wind_degrees}
      <Navigation2Icon
        class="text-text-muted size-[0.8em]!"
        style={`transform: rotate(${current.wind_degrees - 180}deg)`}
      />
    {/if}
  </span>
{/if}
