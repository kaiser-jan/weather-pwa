<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { TODAY_MILLIS } from '$lib/stores/now'
  import { settings } from '$lib/stores/settings'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import { FORECAST_METRICS, METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { queryParam, ssp } from 'sveltekit-search-params'
  import { get } from 'svelte/store'
  import ExpandableList from '$lib/components/ExpandableList.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import ParameterToggle from '$lib/components/weather/ParameterToggle.svelte'
  import PageWrapper from '$lib/components/layout/PageWrapper.svelte'
  import { persisted } from 'svelte-persisted-store'
  import { Switch } from '$lib/components/ui/switch'
  import { ScaleIcon, SquareSplitHorizontalIcon } from '@lucide/svelte'

  const visibleMetrics = queryParam<ForecastMetric[]>(
    'metrics',
    ssp.array(get(settings).sections.components.chart.plottedMetrics as ForecastMetric[]),
  )

  const rollup = persisted('outlook-view-rollup', false)
</script>

<PageWrapper class="gap-4 p-4">
  <WeatherChart
    multiseries={$forecastStore!.multiseries}
    bind:parameters={$visibleMetrics}
    startTimestamp={$TODAY_MILLIS}
    endTimestamp={$TODAY_MILLIS + 1000 * 3600 * 24 * 7}
    className="h-[max(25vh,12rem)]"
    location="outlook"
    rollup={$rollup}
  />

  <div class="flex flex-row items-center gap-2">
    <Switch bind:checked={$rollup} />
    <SquareSplitHorizontalIcon class="ml-2" />
    Daily Average
  </div>

  <ExpandableList
    items={FORECAST_METRICS}
    visibleItems={$settings.data.forecast.metrics}
    markedItems={$visibleMetrics}
    contentClass="gap-2"
  >
    {#snippet itemSnippet(metric)}
      <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
    {/snippet}

    {#snippet children(metrics: ForecastMetric[])}
      <div class="flex flex-row flex-wrap gap-2">
        {#each metrics as metric (metric)}
          {@const details = METRIC_DETAILS[metric]}

          <ParameterToggle {metric} bind:visibleList={$visibleMetrics} class="w-full">
            <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
            <span class="overflow-hidden text-ellipsis whitespace-nowrap"> {details.label} </span>
          </ParameterToggle>
        {/each}
      </div>
    {/snippet}
  </ExpandableList>
</PageWrapper>
