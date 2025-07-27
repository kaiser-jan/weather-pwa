<script lang="ts">
  import { UmbrellaIcon, UmbrellaOffIcon } from '@lucide/svelte'
  import { NOW } from '$lib/stores/now'
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
    return $precipitationGroupsStore.filter((g) => g.end > $NOW && g.start <= relevantEndDatetime)
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
          startDatetime={$NOW.startOf('day')}
          endDatetime={$NOW.endOf('day')}
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
