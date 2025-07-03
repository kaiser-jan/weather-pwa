<script lang="ts">
  import { CHART_SERIES_DETAILS } from '$lib/chart-config'
  import type { Forecast, MultivariateTimeSeriesTimeBucket, WeatherMetricKey } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import { Button } from '../ui/button'
  import WeatherChart from './WeatherChart.svelte'
  import { BoldIcon, RotateCwIcon } from 'lucide-svelte'
  import Toggle from '../ui/toggle/toggle.svelte'
  import * as ToggleGroup from '../ui/toggle-group'

  interface Props {
    dailyMultiseries: MultivariateTimeSeriesTimeBucket[]
  }

  const { dailyMultiseries }: Props = $props()

  let activeChartIndex = $state<number>(0)

  let visibleSeries: WeatherMetricKey[] = $state(['cloud_coverage', 'precipitation_amount', 'temperature'])

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
    <span class="font-bold">{dayLabel}</span>
    <div class="text-text flex flex-row gap-2">
      <ToggleGroup.Root type="multiple" variant="outline" bind:value={visibleSeries}>
        {#each Object.entries(CHART_SERIES_DETAILS) as [key, seriesDetails]}
          <ToggleGroup.Item value={key}>
            <seriesDetails.icon />
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
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
      />
    {/each}
  </div>
</div>
