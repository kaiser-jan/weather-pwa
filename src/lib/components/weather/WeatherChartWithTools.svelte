<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import type {
    Forecast,
    MultivariateTimeSeriesTimeBucket,
    TimeBucket,
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
    day: TimeBucket
  }

  let { day, isToday }: Props = $props()

  const settingsChart = settings.select((s) => s.sections.chart)

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

<ParameterSelect bind:visible={visibleSeries.value} />

{#if timeBucket}
  <div class="flex w-full gap-2 text-sm" transition:slide>
    <div class="border-foreground flex min-h-9 w-fit items-center rounded-lg border-1 p-2">
      <span class="font-bold">{Object.values(timeBucket)[0].datetime.toFormat('HH:mm')}</span>
    </div>
    <div class="text-text border-foreground flex min-h-9 grow flex-row flex-wrap gap-4 rounded-lg border-1 px-2 py-1.5">
      {#each Object.entries(timeBucket) as [parameter, entry]}
        <ParameterValue parameter={parameter as WeatherMetricKey} value={entry?.value} class="min-w-16" />
      {/each}
    </div>
  </div>
{/if}

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
