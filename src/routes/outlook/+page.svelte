<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { TODAY_MILLIS } from '$lib/stores/now'
  import { settings } from '$lib/stores/settings'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import { FORECAST_METRICS, METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { queryParameters, ssp } from 'sveltekit-search-params'
  import { get } from 'svelte/store'
  import ExpandableList from '$lib/components/ExpandableList.svelte'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import ParameterToggle from '$lib/components/weather/ParameterToggle.svelte'
  import PageWrapper from '$lib/components/layout/PageWrapper.svelte'
  import { CircleSlash2Icon, ScaleIcon, SquareSplitHorizontalIcon } from '@lucide/svelte'
  import { DateTime, Settings } from 'luxon'
  import { Toggle } from '$lib/components/ui/toggle'
  import { fromAbsolute } from '@internationalized/date'
  import DateRangePicker from '$lib/components/DateRangePicker.svelte'
  import type { EncodeAndDecodeOptions } from 'sveltekit-search-params/sveltekit-search-params'
  import { persisted } from 'svelte-persisted-store'

  const params = queryParameters<{
    metrics: EncodeAndDecodeOptions<ForecastMetric[]>
  }>(
    {
      metrics: ssp.array(get(settings).sections.components.chart.plottedMetrics as ForecastMetric[]),
    },
    { pushHistory: false },
  )

  let rollup = persisted('outlook-chart-rollup', true)

  let startTimestamp = $state(get(TODAY_MILLIS))
  let endTimestamp = $state($TODAY_MILLIS + 1000 * 3600 * 24 * 6)
</script>

<PageWrapper class="gap-4 p-4">
  <header class="flex flex-row items-center justify-between gap-2">
    <DateRangePicker
      class="grow"
      bind:start={startTimestamp}
      bind:end={endTimestamp}
      calendarProps={{
        minValue: fromAbsolute($forecastStore?.daily[0].timestamp ?? $TODAY_MILLIS, Settings.defaultZone.name),
        maxValue: fromAbsolute(
          $forecastStore?.daily[$forecastStore.daily.length - 1].timestamp ?? $TODAY_MILLIS,
          Settings.defaultZone.name,
        ),
      }}
    />

    <Toggle bind:pressed={() => $rollup, (v) => rollup.set(v)}>
      <CircleSlash2Icon />
    </Toggle>
  </header>

  <WeatherChart
    multiseries={$forecastStore!.multiseries}
    bind:parameters={params.metrics!}
    {startTimestamp}
    endTimestamp={endTimestamp ? DateTime.fromMillis(endTimestamp).endOf('day').toMillis() : undefined}
    className="h-[max(25vh,12rem)]"
    location="outlook"
    rollup={$rollup}
  />

  <ExpandableList
    items={FORECAST_METRICS}
    visibleItems={$settings.data.forecast.metrics}
    markedItems={params.metrics ?? []}
    contentClass="gap-2"
  >
    {#snippet itemSnippet(metric)}
      <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
    {/snippet}

    {#snippet children(metrics: ForecastMetric[])}
      <div class="flex flex-row flex-wrap gap-2">
        {#each metrics as metric (metric)}
          {@const details = METRIC_DETAILS[metric]}

          <ParameterToggle {metric} bind:visibleList={params.metrics!} class="flex-1">
            <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
            <span class="overflow-hidden text-ellipsis whitespace-nowrap"> {details.label} </span>
          </ParameterToggle>
        {/each}
      </div>
    {/snippet}
  </ExpandableList>
</PageWrapper>
