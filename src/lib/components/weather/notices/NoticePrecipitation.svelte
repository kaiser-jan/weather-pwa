<script lang="ts">
  import { ArrowRightIcon, UmbrellaIcon, UmbrellaOffIcon } from '@lucide/svelte'
  import { NOW } from '$lib/stores/now'
  import PrecipitationGroup from '../PrecipitationGroup.svelte'
  import { precipitationGroupsStore } from '$lib/stores/precipitationGroups'

  interface Props {
    always?: boolean
  }

  let { always }: Props = $props()

  const precipitationGroups = $derived.by(() => {
    const relevantEndDatetime = $NOW.hour <= 12 ? $NOW.endOf('day') : $NOW.endOf('day').plus({ hours: 6 })
    return $precipitationGroupsStore.filter((g) => g.end > $NOW && g.start <= relevantEndDatetime)
  })
</script>

{#if precipitationGroups.length > 0}
  <div class="bg-midground inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 px-4 py-3">
    <UmbrellaIcon />
    <div class="flex grow flex-col gap-1">
      {#each precipitationGroups as precipitationGroup}
        <PrecipitationGroup {precipitationGroup} />
      {/each}
    </div>
  </div>
{:else if always}
  <div class="bg-midground inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 px-4 py-3">
    <UmbrellaOffIcon />
    No rain on today!
  </div>
{/if}
