<script lang="ts">
  import { formatRelativeDatetime } from '$lib/utils/ui'
  import type { PrecipitationGroup } from '$lib/stores/precipitationGroups'
  import { ArrowRightIcon } from '@lucide/svelte'
  import { NOW, NOW_MILLIS } from '$lib/stores/now'
  import { DateTime } from 'luxon'
  import MiniPrecipitationChart from './MiniPrecipitationChart.svelte'

  interface Props {
    precipitationGroup: PrecipitationGroup
    startTimestamp: number
    endTimestamp: number
    isRestOfDayOnly?: boolean
  }

  let { precipitationGroup, startTimestamp, endTimestamp, isRestOfDayOnly }: Props = $props()

  let amount = $derived(isRestOfDayOnly ? precipitationGroup.amountAfterNow : precipitationGroup.amount)
</script>

<div class="flex flex-row items-center justify-between gap-2">
  <span class="inline-flex items-center gap-1">
    {#if precipitationGroup.start > $NOW_MILLIS || (!isRestOfDayOnly && precipitationGroup.start >= startTimestamp)}
      {formatRelativeDatetime(DateTime.fromMillis(precipitationGroup.start), {
        omitDate: precipitationGroup.start >= startTimestamp,
      })}
    {/if}
    <ArrowRightIcon class="text-text-muted" />
    {formatRelativeDatetime(DateTime.fromMillis(precipitationGroup.end), {
      omitDate: precipitationGroup.end < endTimestamp,
    })}
    {#if precipitationGroup.isEndOfData}
      <span class="text-text-muted">+</span>
    {/if}
  </span>

  <div class="w-16">
    <MiniPrecipitationChart timeseries={precipitationGroup.timeseries} />
  </div>

  <!-- {#if precipitationGroup.hasBreaks} -->
  <!--   <span class="text-text-muted text-sm italic">sporadic</span> -->
  <!-- {/if} -->
  <!-- TODO: color based on intensity -->
  <!-- TODO: units -->
  <span class="w-[6ch] text-right text-blue-200">{amount.toFixed(precipitationGroup.amount < 0.1 ? 2 : 1)}mm</span>
</div>
