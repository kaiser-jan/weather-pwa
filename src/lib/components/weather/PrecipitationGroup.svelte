<script lang="ts">
  import { formatRelativeDatetime } from '$lib/utils'
  import type { PrecipitationGroup } from '$lib/stores/precipitationGroups'
  import { ArrowRightIcon } from '@lucide/svelte'
  import { NOW } from '$lib/stores/now'
  import type { DateTime } from 'luxon'

  interface Props {
    precipitationGroup: PrecipitationGroup
    startDatetime: DateTime
    endDatetime: DateTime
    isRestOfDayOnly?: boolean
  }

  let { precipitationGroup, startDatetime, endDatetime, isRestOfDayOnly }: Props = $props()
</script>

<div class="flex flex-row items-center justify-between gap-2">
  <span class="inline-flex items-center gap-1">
    {#if precipitationGroup.start > $NOW || (!isRestOfDayOnly && precipitationGroup.start >= startDatetime)}
      {formatRelativeDatetime(precipitationGroup.start, { omitDate: precipitationGroup.start >= startDatetime })}
    {/if}
    <ArrowRightIcon class="text-text-muted" />
    {formatRelativeDatetime(precipitationGroup.end, {
      omitDate: precipitationGroup.end < endDatetime,
    })}
    {#if precipitationGroup.isEndOfData}
      <span class="text-text-muted">+</span>
    {/if}
  </span>
  {#if precipitationGroup.sporadic}
    <span class="text-text-muted text-sm italic">sporadic</span>
  {/if}
  <!-- TODO: color based on intensity -->
  <!-- TODO: units -->
  <!-- TODO: only show amount from now on if isRestOfDayOnly -->
  <span class="text-blue-200">{precipitationGroup.amount.toFixed(precipitationGroup.amount < 0.1 ? 2 : 1)}mm</span>
  <!-- TODO: consider mini chart -->
</div>
