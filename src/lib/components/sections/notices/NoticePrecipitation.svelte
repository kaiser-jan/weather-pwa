<script lang="ts">
  import { UmbrellaIcon, UmbrellaOffIcon } from '@lucide/svelte'
  import { NOW, NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { aggregableMetricGroupsStore } from '$lib/stores/aggregableMetricGroups'
  import { Duration } from 'luxon'
  import AggregableMetricGroup from '$lib/components/weather/AggregableMetricGroup.svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'

  interface Props {
    always?: boolean
  }

  let { always }: Props = $props()

  const precipitationGroups = $derived.by(() => {
    // show at least the next x hours
    const minHours = 8
    const relevantEndDatetime =
      $NOW.hour <= 24 - minHours ? $NOW.endOf('day') : $NOW.plus(Duration.fromObject({ hours: minHours }))
    return $aggregableMetricGroupsStore.precipitation_amount.filter(
      (g) => g.end > $NOW_MILLIS && g.start <= relevantEndDatetime.toMillis(),
    )
  })
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
{:else if always}
  <div class="inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 bg-midground px-4 py-3">
    <UmbrellaOffIcon />
    No rain on today!
  </div>
{/if}
