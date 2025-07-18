<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import type {
    Forecast,
    MultivariateTimeSeriesTimeBucket,
    TimeSeriesNumberEntry,
    WeatherMetricKey,
  } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import WeatherChart from '$lib/components/weather/WeatherChart.svelte'
  import { slide } from 'svelte/transition'
  import { settings } from '$lib/settings/store'
  import { Button } from '../ui/button'
  import ParameterSelect from '../ParameterSelect.svelte'
  import { persistantState } from '$lib/utils/state.svelte'
  import ParameterValue from '../ParameterValue.svelte'
  import { Skeleton } from '../ui/skeleton'
  import { NOW } from '$lib/stores/now'

  interface Props {
    isToday: boolean
    day: Forecast['daily'][number]
  }

  let { day, isToday }: Props = $props()

  const settingsChart = settings.select((s) => s.sections.chart)

  // const today = $derived($forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day'))))

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
      if (isToday) return currentTimeBucket
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
</script>

<div class="bg-midground flex w-full flex-col flex-wrap justify-between gap-2 gap-x-4 gap-y-2 rounded-lg p-2">
  <div class="flex gap-2">
    {#if highlightedTimeBucket}
      <div class="bg-foreground flex h-9 w-fit items-center rounded-lg p-2">
        <span class="">{Object.values(highlightedTimeBucket)[0].datetime.toFormat('HH:mm')}</span>
      </div>
    {/if}

    <ParameterSelect bind:visible={visibleSeries.value} />
  </div>

  <div class="w-full">
    {#if timeBucket}
      <div
        class="text-text border-foreground flex min-h-9 grow flex-row flex-wrap gap-4 rounded-lg border-1 p-2 text-sm"
        transition:slide
      >
        {#each Object.entries(timeBucket) as [parameter, entry]}
          <ParameterValue parameter={parameter as WeatherMetricKey} value={entry?.value} class="min-w-16" />
        {/each}
      </div>
    {/if}
  </div>

  {#if day}
    <WeatherChart
      multiseries={day.multiseries}
      visibleSeries={visibleSeries.value}
      startDateTime={day.datetime}
      endDateTime={day.datetime.plus(day.duration)}
      datetime={$NOW}
      className="snap-center shrink-0 w-full h-[20vh]"
      onHighlightTimestamp={(tb) => (highlightedTimeBucket = tb)}
      onCurrentTimestamp={(tb) => (currentTimeBucket = tb)}
    />
  {:else}
    <Skeleton class="h-full w-full" />
  {/if}
</div>
