<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { TimeBucket, WeatherMetricKey } from '$lib/types/data'
  import { autoFormatMetric } from '$lib/utils/units'
  import { ArrowDownIcon, ArrowUpIcon, type Icon } from '@lucide/svelte'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import { forecastStore } from '$lib/stores/data'
  import type { ParameterDaySummaryProps, SeriesDetails } from '$lib/types/ui'
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import FormattedMetric from '../FormattedMetric.svelte'

  type Props = ParameterDaySummaryProps & {
    parameter: WeatherMetricKey
    day: TimeBucket | null
  }

  let {
    parameter,
    icon,
    items = ['icon', 'min', 'range-bar', 'max'],
    day,
    useTotalAsDomain,
    widthFraction = 1,
  }: Props = $props()

  const details = $derived<SeriesDetails>(CHART_SERIES_DETAILS[parameter] ?? { color: { tailwind: 'bg-text' } })
  const ParameterIcon = $derived(icon ?? details?.icon)

  const domain = $derived.by(() => {
    if (useTotalAsDomain || !day) return $forecastStore?.total?.summary[parameter]

    const summary = day.summary[parameter]
    const min = details.domain.min.findLast((t) => t <= summary.min * 0.9) ?? details.domain.min[0]
    const max = details.domain.max.find((t) => t >= summary.max * 1.1) ?? details.domain.max[0]

    return { min, max }
  })
</script>

{#if day?.summary[parameter]}
  <div
    class="bg-midground flex h-fit grow flex-row items-center gap-2 rounded-lg px-2.5 py-2"
    style={`width: ${widthFraction * 100}%`}
  >
    {#each items as item}
      {#if item === 'icon' && ParameterIcon}
        <ParameterIcon class="shrink-0" />
      {:else if item === 'min' || item === 'max' || item === 'avg' || item === 'sum'}
        <FormattedMetric value={day?.summary[parameter][item]} {parameter} class="w-16" />
        <div class="text-text-muted mt-1 text-xs leading-none">
          {item}
        </div>
      {:else if item === 'range-bar'}
        <NumberRangeBar
          total={domain}
          instance={day?.summary[parameter]}
          color={parameter === 'temperature' ? parameter : details.color?.tailwind?.bg}
          className="h-2"
        />
      {:else if item === 'trend'}
        {@const values = day.multiseries[parameter]}
        {#if values && values[0] < values[values.length]}
          <ArrowUpIcon />
        {:else}
          <ArrowDownIcon />
        {/if}
      {:else}
        ...
      {/if}
    {/each}
  </div>
{/if}
