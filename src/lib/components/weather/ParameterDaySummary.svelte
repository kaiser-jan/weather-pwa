<script lang="ts">
  import type { TimeBucket, ForecastParameter } from '$lib/types/data'
  import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from '@lucide/svelte'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { forecastStore } from '$lib/stores/data'
  import type { CategoryColor, MetricDetails, ParameterDaySummaryProps } from '$lib/types/ui'
  import { categorizeValue, METRIC_DETAILS, useCategoriesForColor, type ForecastMetric } from '$lib/config/metrics'
  import FormattedMetric from '$lib/components/snippets/FormattedMetric.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import { NOW_MILLIS } from '$lib/stores/now'
  import { aggregableMetricGroupsStore } from '$lib/stores/aggregableMetricGroups'
  import { metricGroupsStore, type MetricGroup } from '$lib/stores/metricGroups'
  import AggregableMetricGroup from './AggregableMetricGroup.svelte'
  import { DateTime } from 'luxon'
  import { autoFormatMetric } from '$lib/utils/units'
  import { settings } from '$lib/stores/settings'

  type Props = ParameterDaySummaryProps & {
    metric: ForecastMetric
    day: TimeBucket
    fullDay?: boolean
    compare?: boolean
    align?: boolean
  }

  let { metric, items = ['min', 'range-bar', 'max'], day, useTotalAsDomain, fullDay, compare, align }: Props = $props()

  const details = $derived<MetricDetails>(METRIC_DETAILS[metric])

  const domain = $derived.by(() => {
    if (useTotalAsDomain || !day || !day.summary[metric] || !details) return $forecastStore?.total?.summary[metric]

    const summary = day.summary[metric]
    const min = details.domain.min.findLast((t) => t <= summary.min * 0.9) ?? details.domain.min[0]
    const max = details.domain.max.find((t) => t >= summary.max * 1.1) ?? details.domain.max[0]

    return { min, max }
  })

  const doMinMaxMatch = $derived.by(() => {
    if (!details.categories || !details.preferCategoryLabel) return
    return (
      categorizeValue(details, day.summary[metric].min)?.threshold ===
      categorizeValue(details, day.summary[metric].max)?.threshold
    )
  })

  // TODO: optionally ignore cloud groups when there is no sun
  function formatGroups() {
    const groups = $metricGroupsStore[metric as keyof typeof $metricGroupsStore].filter(
      (g) => g.end > day.timestamp && g.start < day.timestamp + day.duration,
    )

    const formatValue = (v: number) =>
      details.categories && details.preferCategoryLabel
        ? categorizeValue(details, v)?.description
        : autoFormatMetric(v, metric, $settings)
    const formatTime = (t: number) => DateTime.fromMillis(t).toFormat('HH:mm')

    if (!groups.length) return formatValue(day.summary[metric].avg)

    if (groups.length === 3 && Math.abs(groups[0].avg - groups[2].avg) < 10)
      return `${formatValue(groups[0].avg)}, ${formatValue(groups[1].avg)} ${formatTime(groups[1].start)} - ${formatTime(groups[2].start)}`

    let pieces = [`${formatValue(groups[0].avg)}`]

    for (let i = 1; i < groups.length; i++) {
      const group = groups[i]
      pieces.push(`${formatValue(group.avg)} ${formatTime(group.start)}`)
    }

    return pieces.join(', ')
  }
</script>

{#if details}
  <IconOrAbbreviation {details} />
{/if}

{#if day.summary[metric]}
  {#each items as item (item)}
    {#if item === 'min' || (item === 'max' && (!items.includes('min') || !doMinMaxMatch)) || item === 'avg' || item === 'sum'}
      <FormattedMetric value={day?.summary[metric]?.[item]} parameter={metric} categoryIndicator={!compare} />
      <div class="mt-1 text-xs leading-none text-text-muted">
        {item}
      </div>
    {:else if item === 'range' && compare}
      <FormattedMetric value={day.summary[metric]?.min} parameter={metric} class="min-w-12" />
      <NumberRangeBar
        {domain}
        total={$forecastStore?.total.summary[metric]}
        instance={day.summary[metric]}
        {details}
        class="h-2 min-w-16 shrink"
      />
      <FormattedMetric value={day.summary[metric]?.max} parameter={metric} class="min-w-12" />
    {:else if item === 'range' && !compare}
      <FormattedMetric
        value={day.summary[metric]?.min}
        parameter={metric}
        categoryIndicator
        class={[align && 'min-w-12']}
      />
      {#if !doMinMaxMatch}
        <span class="text-muted-foreground">to</span>
        <FormattedMetric
          value={day.summary[metric]?.max}
          parameter={metric}
          categoryIndicator
          class={[align && 'min-w-12']}
        />
      {/if}
    {:else if item === 'range-bar'}
      <NumberRangeBar
        {domain}
        total={$forecastStore?.total.summary[metric]}
        instance={day.summary[metric]}
        {details}
        class="h-2 shrink"
      />
    {:else if item === 'trend'}
      {@const values = day.multiseries[metric]}
      {#if values && values[0].value < values[values.length - 1].value}
        <ArrowUpIcon class="shrink-0" />
      {:else if values}
        <ArrowDownIcon class="shrink-0" />
      {/if}
    {:else if item === 'groups' && metric in $metricGroupsStore}
      {formatGroups()}
    {:else if item === 'aggregated-groups' && metric in $aggregableMetricGroupsStore}
      {@const groups = $aggregableMetricGroupsStore[metric as keyof typeof $aggregableMetricGroupsStore].filter(
        (g) => g.end > day.timestamp && g.start < day.timestamp + day.duration && (fullDay || g.end > $NOW_MILLIS),
      )}
      <div class="flex grow flex-col gap-1">
        {#each groups as group (group.start)}
          <AggregableMetricGroup
            {metric}
            {details}
            {group}
            startTimestamp={day.timestamp}
            endTimestamp={day.timestamp + day.duration}
            class={group.end < $NOW_MILLIS ? 'opacity-60' : ''}
          />
        {:else}
          <span class="text-text-muted mr-auto">None</span>
        {/each}
      </div>
    {/if}
    <!-- TODO: feature: summary, e.g. Overcast avg, 17:00 Clear -->
    <!-- TODO: introduce "focus" to min/max -> will prefer indicating time ranges with minmal/maximal value -->
  {/each}
{:else}
  <span class="text-text-muted"> No data </span>
{/if}
