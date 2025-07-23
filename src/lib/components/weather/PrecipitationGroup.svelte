<script lang="ts">
  import { formatRelativeDatetime } from '$lib/utils'
  import type { PrecipitationGroup } from '$lib/stores/precipitationGroups'
  import { ArrowRightIcon } from '@lucide/svelte'
  import { NOW } from '$lib/stores/now'

  interface Props {
    precipitationGroup: PrecipitationGroup
    isRestOfDayOnly?: boolean
  }

  let { precipitationGroup, isRestOfDayOnly }: Props = $props()
</script>

<div class="flex flex-row items-center justify-between gap-2">
  <span class="inline-flex items-center gap-1">
    {#if precipitationGroup.start > $NOW || !isRestOfDayOnly}
      {formatRelativeDatetime(precipitationGroup.start, { omitDate: true })}
    {/if}
    <ArrowRightIcon class="text-text-muted" />
    {formatRelativeDatetime(precipitationGroup.end, {
      omitDate: precipitationGroup.end.startOf('day').equals(precipitationGroup.start.startOf('day')),
    })}
  </span>
  {#if precipitationGroup.sporadic}
    <span class="text-text-muted text-sm italic">sporadic</span>
  {/if}
  <!-- TODO: color based on intensity -->
  <!-- TODO: units -->
  <span class="text-blue-200">{precipitationGroup.amount.toFixed(precipitationGroup.amount < 0.1 ? 2 : 1)}mm</span>
  <!-- TODO: consider mini chart -->
</div>
