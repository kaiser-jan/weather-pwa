<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW } from '$lib/stores/now'
  import type { ForecastParameter } from '$lib/types/data'
  import { persistantState } from '$lib/utils/state.svelte'
  import ParameterSelect from '$lib/components/ParameterSelect.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/weather/WeatherChart.svelte'
  import { swipe } from 'svelte-gestures'
  import { settings } from '$lib/settings/store'
  import { dayView } from '$lib/stores/ui'
  import type { ForecastMetric } from '$lib/config/metrics'

  const today = $derived($forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day'))))

  let visibleSeries = persistantState<ForecastMetric[]>('section-today-chart-parameters', [
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
      onclick={() => dayView.open(today)}
      use:swipe={() => ({ timeframe: 200, minSwipeDistance: 30, touchAction: 'pan-y' })}
      onswipe={(e) => {
        const tomorrow = $forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day').plus({ days: 1 })))
        if (!tomorrow) return
        if (e.detail.direction === 'left') dayView.open(tomorrow)
      }}
    >
      <WeatherChart
        multiseries={today.multiseries}
        parameters={visibleSeries.value}
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
