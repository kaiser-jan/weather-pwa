<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { TimeBucket, WeatherMetricKey } from '$lib/types/data'
  import { autoFormatMetric } from '$lib/utils/units'
  import { ArrowDownIcon, ArrowUpIcon, type Icon } from '@lucide/svelte'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import { forecastStore } from '$lib/stores/data'
  import type { ColorStop, ParameterDaySummaryProps, SeriesDetails } from '$lib/types/ui'
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import FormattedMetric from '../FormattedMetric.svelte'
  import { cn } from '$lib/utils'
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import { precipitationGroupsStore } from '$lib/stores/precipitationGroups'
  import PrecipitationGroup from './PrecipitationGroup.svelte'

  type Props = ParameterDaySummaryProps & {
    parameter: WeatherMetricKey
    day: TimeBucket
  }

  let { parameter, icon, items = ['icon', 'min', 'range-bar', 'max'], day, useTotalAsDomain }: Props = $props()

  const details = $derived<SeriesDetails>(CHART_SERIES_DETAILS[parameter] ?? { color: { tailwind: 'bg-text' } })
  const ParameterIcon = $derived(icon ?? details?.icon)

  const domain = $derived.by(() => {
    if (useTotalAsDomain || !day) return $forecastStore?.total?.summary[parameter]

    const summary = day.summary[parameter]
    const min = details.domain.min.findLast((t) => t <= summary.min * 0.9) ?? details.domain.min[0]
    const max = details.domain.max.find((t) => t >= summary.max * 1.1) ?? details.domain.max[0]

    return { min, max }
  })

  const colorStyle = $derived.by(() => {
    if (!details.color || !domain) return ''
    // if ('tailwind' in details.color) return details.color.tailwind.bg

    let gradientColorStops: ColorStop[] | null = null
    if ('gradientSetting' in details.color) {
      gradientColorStops = settings.readSetting(details.color.gradientSetting).value as ColorStop[]
    } else if ('gradient' in details.color) {
      gradientColorStops = details.color.gradient
    }

    if (gradientColorStops) {
      return generateCssRangeGradient(domain.min, domain.max, gradientColorStops, 'top')
    }

    return ''
  })
</script>

{#each items as item}
  {#if details.color}
    <!-- NOTE: moving tailwind colors to css will make this easier -->
    <div
      class={cn(
        'absolute left-0 h-full w-1',
        'tailwind' in details.color ? details.color.tailwind?.bg : 'bg-foreground',
      )}
      style={colorStyle}
    ></div>
  {/if}

  {#if item === 'icon' && ParameterIcon}
    <ParameterIcon class="shrink-0" />
  {:else if item === 'min' || item === 'max' || item === 'avg' || item === 'sum'}
    <FormattedMetric
      value={day?.summary[parameter][item]}
      {parameter}
      class={items.includes('range-bar') ? 'w-16' : ''}
    />
    {#if !items.includes('range-bar')}
      <div class="text-text-muted mt-1 text-xs leading-none">
        {item}
      </div>
    {/if}
  {:else if item === 'range-bar'}
    <NumberRangeBar
      total={domain}
      instance={day?.summary[parameter]}
      color={parameter === 'temperature' ? parameter : details.color?.tailwind?.bg}
      className="h-2"
    />
  {:else if item === 'trend'}
    {@const values = day.multiseries[parameter]}
    {#if values && values[0].value < values[values.length - 1].value}
      <ArrowUpIcon />
    {:else}
      <ArrowDownIcon />
    {/if}
  {:else if item === 'precipitation-groups'}
    {@const precipitationGroups = $precipitationGroupsStore.filter(
      (g) => g.end > day.datetime && g.start <= day.datetime.plus(day.duration),
    )}
    <div class="flex flex-col gap-1">
      {#each precipitationGroups as precipitationGroup}
        <PrecipitationGroup {precipitationGroup} />
      {:else}
        <span class="text-text-muted"> No rain on this day! </span>
      {/each}
    </div>
  {:else}
    ...
  {/if}
{/each}
