<script lang="ts">
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import type { MultivariateTimeSeriesTimeBucket, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import WeatherChart from './WeatherChart.svelte'
  import * as ToggleGroup from '../ui/toggle-group'
  import Toggle from '../ui/toggle/toggle.svelte'
  import { slide } from 'svelte/transition'
  import { CONFIG } from '$lib/config'
  import { Button } from '../ui/button'

  interface Props {
    dailyMultiseries: MultivariateTimeSeriesTimeBucket[]
  }

  const { dailyMultiseries }: Props = $props()

  let activeChartIndex = $state<number>(0)
  let chartScroller = $state<HTMLDivElement>()

  let visibleSeries: WeatherMetricKey[] = $state(['cloud_coverage', 'precipitation_amount', 'temperature'])

  let currentTimeBucket = $state<Record<WeatherMetricKey, TimeSeriesNumberEntry> | null>(null)
  let highlightedTimeBucket = $state<Record<WeatherMetricKey, TimeSeriesNumberEntry> | null>(null)

  let timeBucket = $derived.by(() => {
    if (highlightedTimeBucket) return highlightedTimeBucket
    if (activeChartIndex === 0) return currentTimeBucket
    if (CONFIG.chart.alwaysShowValuesDisplay) return createEmptyTimeBucket()
    return null
  })

  function createEmptyTimeBucket() {
    const emptyTimeBucket = { ...currentTimeBucket }
    for (const key of Object.keys(emptyTimeBucket)) {
      emptyTimeBucket[key as keyof typeof emptyTimeBucket] = undefined
    }
    return emptyTimeBucket
  }

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
  <div class="-mb-1.5 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <Button
      variant="secondary"
      class="h-9 border-1 p-2"
      onclick={() => {
        activeChartIndex = 0
        if (chartScroller) chartScroller.scrollTo({ left: 0, behavior: 'smooth' })
      }}
    >
      <span class="font-bold">{dayLabel}</span>
      {#if highlightedTimeBucket}
        <span class="">{Object.values(highlightedTimeBucket)[0].datetime.toFormat('HH:mm')}</span>
      {/if}
    </Button>
    <ToggleGroup.Root type="multiple" variant="outline" bind:value={visibleSeries}>
      {#each Object.entries(CHART_SERIES_DETAILS) as [key, seriesDetails]}
        <ToggleGroup.Item value={key}>
          <seriesDetails.icon />
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>

    <div class=" w-full">
      {#if timeBucket}
        <div
          class="text-text border-foreground flex h-9 grow flex-row gap-4 rounded-lg border-1 text-sm"
          transition:slide
        >
          {#each Object.entries(timeBucket) as [parameter, entry]}
            {@const details = CHART_SERIES_DETAILS[parameter as WeatherMetricKey]!}
            {@const showZeroIcon = entry?.value === 0 && details.iconIfZero}
            {@const ParameterIcon = showZeroIcon ? details.iconIfZero : details.icon}
            <div class="align-center flex flex-1 flex-row items-center justify-center gap-1 last:mr-1.5">
              <ParameterIcon />
              {#if entry?.value === undefined}
                <span>-</span>
              {:else if !showZeroIcon}
                <!-- TODO: proper formatting -->
                <span class="whitespace-nowrap"
                  >{entry?.value?.toFixed(details.unit === '%' ? 0 : 1) + details.unit}</span
                >
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div
    class="scrollbar-none flex w-full shrink-0 snap-x snap-mandatory flex-row gap-4 overflow-x-scroll"
    bind:this={chartScroller}
    onscroll={handleChartScroll}
  >
    {#each dailyMultiseries.entries() as [index, timeBucket]}
      <WeatherChart
        multiseries={timeBucket.series}
        {visibleSeries}
        loaded={activeChartIndex >= index - 1 && activeChartIndex <= index + 1}
        startDateTime={timeBucket.datetime}
        endDateTime={timeBucket.datetime.plus(timeBucket.duration)}
        className="snap-center shrink-0 w-full min-h-10"
        onHighlightTimestamp={(tb) => (highlightedTimeBucket = tb)}
        onCurrentTimestamp={(tb) => (currentTimeBucket = tb)}
      />
    {/each}
  </div>
</div>
