<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW } from '$lib/stores/now'
  import type { WeatherMetricKey } from '$lib/types/data'
  import { persistantState } from '$lib/utils/state.svelte'
  import ParameterSelect from '$lib/components/ParameterSelect.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/weather/WeatherChart.svelte'
  import { selectedDay } from '$lib/stores/ui'
  import { swipe } from 'svelte-gestures'
  import { settings } from '$lib/settings/store'

  const today = $derived($forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day'))))

  let visibleSeries = persistantState<WeatherMetricKey[]>('section-today-chart-parameters', [
    'temperature',
    'precipitation_amount',
    'cloud_coverage',
  ])
</script>

<div class="bg-midground flex w-full flex-col flex-wrap justify-between gap-2 gap-x-4 gap-y-2 rounded-lg p-2">
  {#if $settings.sections.today.showChartParameterSelect}
    <ParameterSelect bind:visible={visibleSeries.value} />
  {/if}

  {#if today}
    <button
      onclick={() => selectedDay.set(today)}
      use:swipe={() => ({ timeframe: 200, minSwipeDistance: 30 })}
      onswipe={(e) => {
        const tomorrow = $forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day').plus({ days: 1 })))
        if (!tomorrow) return
        if (e.detail.direction === 'left') selectedDay.set(tomorrow)
      }}
    >
      <WeatherChart
        multiseries={today.multiseries}
        visibleSeries={visibleSeries.value}
        startDateTime={today.datetime}
        endDateTime={today.datetime.plus(today.duration)}
        datetime={$NOW}
        className="snap-center shrink-0 w-full h-[25vh]"
      />
    </button>
  {:else}
    <Skeleton class="h-[25vh] w-full" />
  {/if}
</div>
