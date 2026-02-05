<script lang="ts">
  import { UmbrellaIcon, UmbrellaOffIcon } from '@lucide/svelte'
  import { TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { aggregableMetricGroupsUpcomingStore } from '$lib/stores/aggregableMetricGroups'
  import AggregableMetricGroup from '$lib/components/weather/AggregableMetricGroup.svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'

  const precipitationGroups = $aggregableMetricGroupsUpcomingStore.precipitation_amount
</script>

{#if precipitationGroups.length > 0}
  <div class="inline-flex grow items-center gap-4 rounded-md border-l-6 border-blue-300 bg-midground px-4 py-3">
    <UmbrellaIcon />
    <div class="flex grow flex-col gap-1">
      {#each precipitationGroups as precipitationGroup (precipitationGroup.start)}
        <AggregableMetricGroup
          metric="precipitation_amount"
          details={METRIC_DETAILS['precipitation_amount']}
          group={precipitationGroup}
          isRestOfDayOnly
          startTimestamp={$TODAY_MILLIS}
          endTimestamp={$TOMORROW_MILLIS}
        />
      {/each}
    </div>
  </div>
{/if}
