<script lang="ts">
  import type { TimeBucket, ForecastParameter } from '$lib/types/data'
  import { ArrowDownIcon, ArrowUpIcon } from '@lucide/svelte'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { forecastStore } from '$lib/stores/data'
  import type { ColorStop, MetricDetails, ParameterDaySummaryProps } from '$lib/types/ui'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import FormattedMetric from '$lib/components/snippets/FormattedMetric.svelte'
  import { precipitationGroupsStore } from '$lib/stores/precipitationGroups'
  import PrecipitationGroup from '$lib/components/weather/PrecipitationGroup.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import ParameterToggle from './ParameterToggle.svelte'

  type Props = ParameterDaySummaryProps & {
    parameter: ForecastParameter
    visibleList: ForecastParameter[]
    day: TimeBucket
  }

  let {
    parameter,
    items = ['icon', 'min', 'range-bar', 'max'],
    day,
    useTotalAsDomain,
    visibleList = $bindable(),
  }: Props = $props()

  const details = $derived<MetricDetails | undefined>(METRIC_DETAILS[parameter])

  const domain = $derived.by(() => {
    if (useTotalAsDomain || !day || !day.summary[parameter] || !details)
      return $forecastStore?.total?.summary[parameter]

    const summary = day.summary[parameter]
    const min = details.domain.min.findLast((t) => t <= summary.min * 0.9) ?? details.domain.min[0]
    const max = details.domain.max.find((t) => t >= summary.max * 1.1) ?? details.domain.max[0]

    return { min, max }
  })
</script>

<ParameterToggle {parameter} bind:visibleList {domain}>
  {#each items as item (item)}
    {#if item === 'icon' && details}
      <IconOrAbbreviation {details} />
    {:else if item === 'min' || item === 'max' || item === 'avg' || item === 'sum'}
      <FormattedMetric
        value={day?.summary[parameter]?.[item]}
        {parameter}
        class={items.includes('range-bar') ? 'w-16' : ''}
      />
      {#if !items.includes('range-bar')}
        <div class="text-text-muted mt-1 text-xs leading-none">
          {item}
        </div>
      {/if}
    {:else if item === 'range-bar' && day.summary[parameter]}
      <NumberRangeBar total={domain} instance={day.summary[parameter]} color={details?.color} className="h-2" />
    {:else if item === 'trend'}
      {@const values = day.multiseries[parameter]}
      {#if values && values[0].value < values[values.length - 1].value}
        <ArrowUpIcon />
      {:else if values}
        <ArrowDownIcon />
      {/if}
    {:else if item === 'precipitation-groups'}
      {@const precipitationGroups = $precipitationGroupsStore.filter(
        (g) => g.end > day.timestamp && g.start < day.timestamp + day.duration,
      )}
      <div class="flex flex-col gap-1">
        {#each precipitationGroups as precipitationGroup (precipitationGroup.start)}
          <PrecipitationGroup
            {precipitationGroup}
            startTimestamp={day.timestamp}
            endTimestamp={day.timestamp + day.duration}
          />
        {:else}
          <span class="text-text-muted">No rain on this day!</span>
        {/each}
      </div>
    {:else}
      ...
    {/if}
  {/each}
</ParameterToggle>
