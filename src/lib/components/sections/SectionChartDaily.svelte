<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import type { MultivariateTimeSeriesTimeBucket, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import WeatherChart from '$lib/components/weather/WeatherChart.svelte'
  import { slide } from 'svelte/transition'
  import { settings } from '$lib/settings/store'
  import { Button } from '../ui/button'
  import ParameterSelect from '../ParameterSelect.svelte'
  import { persistantState } from '$lib/utils/state.svelte'
  import ParameterValue from '../ParameterValue.svelte'

  const settingsChart = settings.select((s) => s.sections.chart)

  let activeChartIndex = $state<number>(0)
  let chartScroller = $state<HTMLDivElement>()

  let visibleSeries = persistantState<WeatherMetricKey[]>('chart-parameters-visible', [
    'temperature',
    'precipitation_amount',
    'cloud_coverage',
  ])

  let currentTimeBucket = $state<Record<WeatherMetricKey, TimeSeriesNumberEntry> | null>(null)
  let highlightedTimeBucket = $state<Record<WeatherMetricKey, TimeSeriesNumberEntry> | null>(null)

  let timeBucket = $derived.by(() => {
    if ($settingsChart.tooltip) return null
    if (highlightedTimeBucket) return highlightedTimeBucket
    if ($settingsChart.alwaysShowValuesDisplay) {
      if (activeChartIndex === 0) return currentTimeBucket
      else return createEmptyTimeBucket()
    }
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
    if (!$forecastStore?.daily || $forecastStore.daily.length === 0) return
    if ($forecastStore.daily[activeChartIndex].datetime.startOf('day').equals(DateTime.now().startOf('day')))
      return 'Today'
    return $forecastStore.daily[activeChartIndex].datetime.toFormat('cccc')
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

    <ParameterSelect bind:visible={visibleSeries.value} />

    <div class="w-full">
      {#if timeBucket}
        <div
          class="text-text border-foreground flex h-9 grow flex-row gap-4 rounded-lg border-1 text-sm"
          transition:slide
        >
          {#each Object.entries(timeBucket) as [parameter, entry]}
            <ParameterValue parameter={parameter as WeatherMetricKey} value={entry.value} />
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
    {#each $forecastStore?.daily?.entries() as [index, day]}
      <WeatherChart
        multiseries={day.multiseries}
        visibleSeries={visibleSeries.value}
        loaded={activeChartIndex >= index - 1 && activeChartIndex <= index + 1}
        startDateTime={day.datetime}
        endDateTime={day.datetime.plus(day.duration)}
        className="snap-center shrink-0 w-full min-h-10"
        onHighlightTimestamp={(tb) => (highlightedTimeBucket = tb)}
        onCurrentTimestamp={(tb) => (currentTimeBucket = tb)}
      />
    {/each}
  </div>
</div>
