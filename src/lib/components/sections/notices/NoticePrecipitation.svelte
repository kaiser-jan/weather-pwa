<script lang="ts">
  import { UmbrellaIcon, UmbrellaOffIcon } from '@lucide/svelte'
  import { NOW, NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import PrecipitationGroup from '$lib/components/weather/PrecipitationGroup.svelte'
  import { precipitationGroupsStore } from '$lib/stores/precipitationGroups'
  import { Duration } from 'luxon'

  interface Props {
    always?: boolean
  }

  let { always }: Props = $props()

  const precipitationGroups = $derived.by(() => {
    // show at least the next x hours
    const minHours = 8
    const relevantEndDatetime =
      $NOW.hour <= 24 - minHours ? $NOW.endOf('day') : $NOW.plus(Duration.fromObject({ hours: minHours }))
    return $precipitationGroupsStore.filter((g) => g.end > $NOW_MILLIS && g.start <= relevantEndDatetime.toMillis())
  })
</script>

{#if precipitationGroups.length > 0}
  <div class="bg-midground inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 px-4 py-3">
    <UmbrellaIcon />
    <div class="flex grow flex-col gap-1">
      {#each precipitationGroups as precipitationGroup (precipitationGroup.start)}
        <PrecipitationGroup
          {precipitationGroup}
          isRestOfDayOnly
          startTimestamp={$TODAY_MILLIS}
          endTimestamp={$TOMORROW_MILLIS}
        />
      {/each}
    </div>
  </div>
{:else if always}
  <div class="bg-midground inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 px-4 py-3">
    <UmbrellaOffIcon />
    No rain on today!
  </div>
{/if}
