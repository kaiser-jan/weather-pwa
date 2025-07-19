<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW } from '$lib/stores/now'
  import type { TimeBucket, WeatherMetricKey } from '$lib/types/data'
  import { persistantState } from '$lib/utils/state.svelte'
  import ParameterSelect from '../ParameterSelect.svelte'
  import { Skeleton } from '../ui/skeleton'
  import WeatherChart from '../weather/WeatherChart.svelte'
  import ChartValuesDisplay from '../weather/ChartValuesDisplay.svelte'
  import { selectedDay } from '$lib/stores/selectedDay'
  import { swipe } from 'svelte-gestures'

  interface Props {}

  let {}: Props = $props()

  const today = $derived($forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day'))))

  let visibleSeries = persistantState<WeatherMetricKey[]>('chart-parameters-visible', [
    'temperature',
    'precipitation_amount',
    'cloud_coverage',
  ])
</script>

<button
  class="bg-midground flex w-full flex-col flex-wrap justify-between gap-2 gap-x-4 gap-y-2 rounded-lg p-2"
  onclick={() => selectedDay.set(today)}
  use:swipe={() => ({ timeframe: 200, minSwipeDistance: 30 })}
  onswipe={(e) => {
    const tomorrow = $forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day').plus({ days: 1 })))
    if (!tomorrow) return
    if (e.detail.direction === 'left') selectedDay.set(tomorrow)
  }}
>
  <ParameterSelect bind:visible={visibleSeries.value} />

  {#if today}
    <WeatherChart
      multiseries={today.multiseries}
      visibleSeries={visibleSeries.value}
      startDateTime={today.datetime}
      endDateTime={today.datetime.plus(today.duration)}
      datetime={$NOW}
      className="snap-center shrink-0 w-full h-[20vh]"
    />
  {:else}
    <Skeleton class="h-full w-full" />
  {/if}
</button>
