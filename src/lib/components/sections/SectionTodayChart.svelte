<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW, NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { persist } from '$lib/utils/state.svelte'
  import ParameterSelect from '$lib/components/ParameterSelect.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/weather/WeatherChart.svelte'
  import { swipe } from 'svelte-gestures'
  import { settings } from '$lib/settings/store'
  import { dayView } from '$lib/stores/ui'
  import type { ForecastMetric } from '$lib/config/metrics'
  import SectionTitle from './SectionTitle.svelte'
  import { ChevronRightIcon, ClockIcon } from '@lucide/svelte'

  const today = $derived($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS))

  let visibleSeries = persist<ForecastMetric[]>('section-today-chart-parameters', [
    'temperature',
    'precipitation_amount',
    'cloud_coverage',
  ])
</script>

<SectionTitle
  title="Today"
  icon={ClockIcon}
  onclick={() => dayView.open($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS) ?? null)}
>
  <ChevronRightIcon class="ml-auto" />
</SectionTitle>
<div class="bg-midground flex w-full flex-col flex-wrap justify-between gap-2 gap-x-4 gap-y-2 rounded-lg p-2">
  {#if $settings.sections.today.showChartParameterSelect}
    <ParameterSelect bind:visible={$visibleSeries} />
  {/if}

  {#if today}
    <button
      onclick={() => dayView.open(today)}
      use:swipe={() => ({ timeframe: 200, minSwipeDistance: 30, touchAction: 'pan-y' })}
      onswipe={(e) => {
        const tomorrow = $forecastStore?.daily.find((d) => d.timestamp === $TOMORROW_MILLIS)
        if (!tomorrow) return
        if (e.detail.direction === 'left') dayView.open(tomorrow)
      }}
    >
      <WeatherChart
        multiseries={today.multiseries}
        parameters={$visibleSeries}
        startTimestamp={today.timestamp}
        endTimestamp={today.timestamp + today.duration}
        timestamp={$NOW_MILLIS}
        className="snap-center shrink-0 w-full h-[25vh]"
      />
    </button>
  {:else}
    <Skeleton class="h-[25vh] w-full" />
  {/if}
</div>
