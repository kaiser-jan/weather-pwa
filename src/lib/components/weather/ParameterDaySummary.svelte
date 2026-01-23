<script lang="ts">
  import type { TimeBucket, ForecastParameter } from '$lib/types/data'
  import { ArrowDownIcon, ArrowUpIcon } from '@lucide/svelte'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { forecastStore } from '$lib/stores/data'
  import type { CategoryColor, MetricDetails, ParameterDaySummaryProps } from '$lib/types/ui'
  import { categorizeValue, METRIC_DETAILS, useCategoriesForColor, type ForecastMetric } from '$lib/config/metrics'
  import FormattedMetric from '$lib/components/snippets/FormattedMetric.svelte'
  import { precipitationGroupsStore } from '$lib/stores/precipitationGroups'
  import PrecipitationGroup from '$lib/components/weather/PrecipitationGroup.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import { NOW_MILLIS } from '$lib/stores/now'

  type Props = ParameterDaySummaryProps & {
    metric: ForecastMetric
    day: TimeBucket
    fullDay?: boolean
  }

  let { metric, items = ['min', 'range-bar', 'max'], day, useTotalAsDomain, fullDay }: Props = $props()

  const details = $derived<MetricDetails>(METRIC_DETAILS[metric])

  const domain = $derived.by(() => {
    if (useTotalAsDomain || !day || !day.summary[metric] || !details) return $forecastStore?.total?.summary[metric]

    const summary = day.summary[metric]
    const min = details.domain.min.findLast((t) => t <= summary.min * 0.9) ?? details.domain.min[0]
    const max = details.domain.max.find((t) => t >= summary.max * 1.1) ?? details.domain.max[0]

    return { min, max }
  })

  const doMinMaxMatch = $derived.by(() => {
    if (!details.categories && details.preferCategoryLabel) return
    return (
      categorizeValue(details, day.summary[metric].min)?.threshold ===
      categorizeValue(details, day.summary[metric].max)?.threshold
    )
  })
</script>

{#if details}
  <IconOrAbbreviation {details} />
{/if}

{#if day.summary[metric]}
  {#each items as item (item)}
    {#if item === 'min' || item === 'max' || item === 'avg' || item === 'sum'}
      <FormattedMetric
        value={day?.summary[metric]?.[item]}
        parameter={metric}
        class={items.includes('range-bar') ? 'w-16' : ''}
        categoryIndicator={!items.includes('range-bar')}
      />
      {#if !items.includes('range-bar')}
        <div class="mt-1 text-xs leading-none text-text-muted">
          {item}
        </div>
      {/if}
    {:else if item === 'range'}
      <FormattedMetric value={day.summary[metric]?.min} parameter={metric} categoryIndicator />
      {#if !doMinMaxMatch}
        -
        <FormattedMetric value={day.summary[metric]?.max} parameter={metric} categoryIndicator />
      {/if}
    {:else if item === 'range-bar'}
      <NumberRangeBar total={domain} instance={day.summary[metric]} {details} className="h-2" />
    {:else if item === 'trend'}
      {@const values = day.multiseries[metric]}
      {#if values && values[0].value < values[values.length - 1].value}
        <ArrowUpIcon />
      {:else if values}
        <ArrowDownIcon />
      {/if}
    {:else if item === 'precipitation-groups'}
      {@const precipitationGroups = $precipitationGroupsStore.filter(
        (g) => g.end > day.timestamp && g.start < day.timestamp + day.duration && (fullDay || g.end > $NOW_MILLIS),
      )}
      <div class="flex grow flex-col gap-1">
        {#each precipitationGroups as precipitationGroup (precipitationGroup.start)}
          <PrecipitationGroup
            {precipitationGroup}
            startTimestamp={day.timestamp}
            endTimestamp={day.timestamp + day.duration}
            class={precipitationGroup.end < $NOW_MILLIS ? 'opacity-60' : ''}
          />
        {:else}
          <span class="text-text-muted mr-auto">No rain on this day!</span>
        {/each}
      </div>
    {:else}
      ...
    {/if}
    <!-- TODO: summary, e.g. Overcast avg, 17:00 Clear -->
    <!-- TODO: introduce "focus" to min/max -> will prefer indicating time ranges with minmal/maximal value -->
  {/each}
{:else}
  <span class="text-text-muted"> No data </span>
{/if}
