<script lang="ts">
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import type { MultivariateTimeSeriesTimeBucket, TimeSeriesNumberEntry, WeatherMetricKey } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import WeatherChart from './WeatherChart.svelte'
  import { slide } from 'svelte/transition'
  import { settings } from '$lib/settings/store'
  import { Button } from '../ui/button'
  import { formatMetric, getPreferredUnit } from '$lib/utils/units'
  import ParameterSelect from '../ParameterSelect.svelte'
  import { persistantState } from '$lib/utils/state.svelte'

  interface Props {
    dailyMultiseries: MultivariateTimeSeriesTimeBucket[]
  }

  const { dailyMultiseries }: Props = $props()

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
    if (!dailyMultiseries || dailyMultiseries.length === 0) return
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

    <ParameterSelect bind:visible={visibleSeries.value} />

    <div class=" w-full">
      {#if timeBucket}
        <div
          class="text-text border-foreground flex h-9 grow flex-row gap-4 rounded-lg border-1 text-sm"
          transition:slide
        >
          {#each Object.entries(timeBucket) as [parameter, entry]}
            {@const parameterTyped = parameter as WeatherMetricKey}
            {@const details = CHART_SERIES_DETAILS[parameterTyped]!}
            {@const showZeroIcon = entry?.value === 0 && details.iconIfZero}
            {@const ParameterIcon = showZeroIcon ? details.iconIfZero : details.icon}
            <div class="align-center flex flex-1 flex-row items-center justify-center gap-1 last:mr-1.5">
              <ParameterIcon />
              {#if entry?.value === undefined}
                <span>-</span>
              {:else if !showZeroIcon}
                <!-- TODO: proper formatting -->
                <span class="whitespace-nowrap">
                  {formatMetric(entry?.value, parameterTyped, getPreferredUnit(parameterTyped))}
                </span>
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
        visibleSeries={visibleSeries.value}
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
