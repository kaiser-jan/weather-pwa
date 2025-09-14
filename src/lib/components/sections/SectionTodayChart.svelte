<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW, NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import ParameterSelect from '$lib/components/visualization/chart/ParameterSelect.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import { swipe } from 'svelte-gestures'
  import { settings } from '$lib/settings/store'
  import { dayView } from '$lib/stores/ui'
  import type { ForecastMetric } from '$lib/config/metrics'
  import { ChevronRightIcon, ClockIcon } from '@lucide/svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'

  const today = $derived($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS))

  let visibleMetrics = $state<ForecastMetric[]>($settings.sections.components.chart.plottedMetrics)
</script>

<SectionTitle
  title="Today"
  icon={ClockIcon}
  onclick={() => dayView.open($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS) ?? null)}
>
  <ChevronRightIcon class="ml-auto" />
</SectionTitle>
<FailSafeContainer
  name="Section Today"
  class="bg-midground flex w-full flex-col flex-wrap justify-between gap-x-4 gap-y-2 rounded-lg p-2"
>
  {#if $settings.sections.today.showChartParameterSelect && today}
    <ParameterSelect bind:visible={visibleMetrics} timebucket={today} />
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
        parameters={visibleMetrics}
        startTimestamp={today.timestamp}
        endTimestamp={today.timestamp + today.duration}
        timestamp={$NOW_MILLIS}
        className="snap-center shrink-0 w-full h-[25vh]"
      />
    </button>
  {:else}
    <Skeleton class="h-[25vh] w-full" />
  {/if}
</FailSafeContainer>
