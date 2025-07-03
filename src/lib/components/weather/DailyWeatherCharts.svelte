<script lang="ts">
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import type { MultivariateTimeSeriesTimeBucket, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import WeatherChart from './WeatherChart.svelte'
  import * as ToggleGroup from '../ui/toggle-group'
  import Toggle from '../ui/toggle/toggle.svelte'

  interface Props {
    dailyMultiseries: MultivariateTimeSeriesTimeBucket[]
  }

  const { dailyMultiseries }: Props = $props()

  let activeChartIndex = $state<number>(0)

  let visibleSeries: WeatherMetricKey[] = $state(['cloud_coverage', 'precipitation_amount', 'temperature'])

  let highlightedTimeBucket: Record<WeatherMetricKey, TimeSeriesNumberEntry> | null = $state(null)

  function handleChartScroll(event: { currentTarget: EventTarget & HTMLDivElement }) {
    const { currentTarget } = event
    if (!currentTarget) return
    activeChartIndex = Math.round(currentTarget.scrollLeft / (currentTarget.offsetWidth + currentTarget.offsetLeft))
  }

  const dayLabel = $derived.by(() => {
    if (dailyMultiseries[activeChartIndex].datetime.startOf('day').equals(DateTime.now().startOf('day'))) return 'Today'
    return dailyMultiseries[activeChartIndex].datetime.toFormat('cccc')
  })
</script>

<div class="bg-midground flex w-full flex-col gap-2 rounded-lg p-2">
  <div class="flex flex-row items-center justify-between gap-2">
    <div class="ml-1.5 flex flex-row gap-2">
      <span class="font-bold">{dayLabel}</span>
      {#if highlightedTimeBucket}
        <span class="">{Object.values(highlightedTimeBucket)[0].datetime.toFormat('HH:mm')}</span>
      {/if}
    </div>
    <div class="text-text flex flex-row gap-4 text-sm">
      {#if highlightedTimeBucket}
        {#each Object.entries(highlightedTimeBucket) as [parameter, entry]}
          {@const details = CHART_SERIES_DETAILS[parameter as WeatherMetricKey]!}
          <div class="flex h-9 flex-row items-center gap-1 last:mr-1.5">
            <details.icon />
            <!-- TODO: proper formatting -->
            {entry.value.toFixed(details.unit === '%' ? 0 : 1) + details.unit}
          </div>
        {/each}
      {:else}
        <ToggleGroup.Root type="multiple" variant="outline" bind:value={visibleSeries}>
          {#each Object.entries(CHART_SERIES_DETAILS) as [key, seriesDetails]}
            <ToggleGroup.Item value={key}>
              <seriesDetails.icon />
            </ToggleGroup.Item>
          {/each}
        </ToggleGroup.Root>
      {/if}
    </div>
  </div>

  <div
    class="scrollbar-none flex w-full shrink-0 snap-x snap-mandatory flex-row gap-4 overflow-x-scroll"
    onscroll={handleChartScroll}
  >
    {#each dailyMultiseries.entries() as [index, timeBucket]}
      <WeatherChart
        multiseries={timeBucket.series}
        {visibleSeries}
        loaded={activeChartIndex >= index - 1 && activeChartIndex <= index + 1}
        startDateTime={timeBucket.datetime}
        endDateTime={timeBucket.datetime.plus(timeBucket.duration)}
        className="snap-center shrink-0 w-full"
        ontimestamp={(tb) => (highlightedTimeBucket = tb)}
      />
    {/each}
  </div>
</div>
