<script lang="ts">
  import { formatRelativeDatetime } from '$lib/utils/ui'
  import { ArrowRightIcon } from '@lucide/svelte'
  import { NOW, NOW_MILLIS } from '$lib/stores/now'
  import { DateTime } from 'luxon'
  import { cn } from '$lib/utils'
  import FormattedMetric from '../snippets/FormattedMetric.svelte'
  import MiniBarChart from './MiniBarChart.svelte'
  import type { MetricDetails } from '$lib/types/ui'
  import type { AggregableMetricGroup } from '$lib/stores/aggregableMetricGroups'
  import type { ForecastMetric } from '$lib/config/metrics'

  interface Props {
    metric: ForecastMetric
    details: MetricDetails
    group: AggregableMetricGroup
    startTimestamp: number
    endTimestamp: number
    isRestOfDayOnly?: boolean
    class?: string
  }

  let { metric, details, group, startTimestamp, endTimestamp, isRestOfDayOnly, class: className }: Props = $props()

  let amount = $derived(isRestOfDayOnly ? group.amountAfterNow : group.amount)
</script>

<div class={cn('flex flex-row items-center justify-between gap-2', className)}>
  <span class="inline-flex items-center gap-1">
    {#if group.start > $NOW_MILLIS || (!isRestOfDayOnly && group.start >= startTimestamp)}
      {formatRelativeDatetime(DateTime.fromMillis(group.start), {
        omitDate: group.start >= startTimestamp,
      })}
    {/if}
    <ArrowRightIcon class="text-text-muted" />
    {formatRelativeDatetime(DateTime.fromMillis(group.end), {
      omitDate: group.end < endTimestamp,
    })}
    {#if group.isEndOfData}
      <span class="text-text-muted">+</span>
    {/if}
  </span>

  <div class="w-16">
    <MiniBarChart timeseries={group.timeseries} {details} />
  </div>

  <!-- {#if precipitationGroup.hasBreaks} -->
  <!--   <span class="text-text-muted text-sm italic">sporadic</span> -->
  <!-- {/if} -->

  <!-- TODO: color based on intensity -->
  <FormattedMetric parameter={metric} value={amount} class="text-blue-200" accumulated />
</div>
