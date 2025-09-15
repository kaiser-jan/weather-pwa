<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW, NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import ParameterSelect from '$lib/components/visualization/chart/ParameterSelect.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import { swipe } from 'svelte-gestures'
  import { settings } from '$lib/settings/store'
  import { dayView } from '$lib/stores/ui'
  import { METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { ChevronRightIcon, ClockIcon } from '@lucide/svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import { coordinates } from '$lib/stores/location'
  import { getStartOfDayTimestamp, getEndOfDayTimestamp } from '$lib/utils'
  import { DateTime } from 'luxon'
  import TimelineBar from '$lib/components/visualization/TimelineBar.svelte'
  import ParameterDaySummary from '$lib/components/weather/ParameterDaySummary.svelte'
  import type { TimeBucket } from '$lib/types/data'

  interface Props {
    timebucket: TimeBucket | undefined
    metrics: ForecastMetric[]
    title: string
    icon: typeof ChevronRightIcon
    showChart: boolean
    showSummary: boolean
  }

  let { timebucket, metrics = $bindable(), title, icon, showChart, showSummary }: Props = $props()
</script>

<SectionTitle {title} {icon} onclick={() => dayView.open(timebucket)}>
  <ChevronRightIcon class="ml-auto" />
</SectionTitle>

{#if timebucket}
  <TimelineBar
    multiseries={timebucket.multiseries}
    startTimestamp={getStartOfDayTimestamp(timebucket.timestamp)}
    endTimestamp={getEndOfDayTimestamp(timebucket.timestamp)}
    parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
    marks={$settings.sections.components.timelineBar.marks.map((m) => DateTime.fromMillis(timebucket.timestamp).set(m))}
    coordinates={$coordinates}
    datetime={$NOW_MILLIS}
    className="h-2 mt-1"
  />

  {#if showSummary}
    <FailSafeContainer
      name={`Section ${title}`}
      class="bg-midground flex w-full flex-col flex-wrap justify-between gap-x-4 gap-y-2 rounded-lg p-2 px-3"
      onclick={() => dayView.open(timebucket)}
    >
      <div class="flex flex-row flex-wrap gap-2">
        {#each $settings.sections.today.metrics as metric (metric)}
          {@const config = METRIC_DETAILS[metric].summary}
          <div class="flex w-full flex-row flex-nowrap items-center gap-2">
            <ParameterDaySummary {...config} {metric} day={timebucket} />
          </div>
        {/each}
      </div>
    </FailSafeContainer>
  {/if}

  {#if showChart}
    <FailSafeContainer
      name={`Section ${title} Chart`}
      class="bg-midground flex w-full flex-col flex-wrap justify-between gap-x-4 gap-y-2 rounded-lg p-2"
    >
      <div
        use:swipe={() => ({ timeframe: 200, minSwipeDistance: 30, touchAction: 'pan-y' })}
        onswipe={(e) => {
          const tomorrow = $forecastStore?.daily.find((d) => d.timestamp === $TOMORROW_MILLIS)
          if (!tomorrow) return
          if (e.detail.direction === 'left') dayView.open(tomorrow)
        }}
      >
        <WeatherChart
          multiseries={timebucket.multiseries}
          parameters={metrics}
          startTimestamp={timebucket.timestamp}
          endTimestamp={timebucket.timestamp + timebucket.duration}
          timestamp={$NOW_MILLIS}
          className="snap-center shrink-0 w-full h-[max(20vh,12rem)]"
          hideYAxes={$settings.sections.components.chart.showYAxes !== 'always'}
          parameterSelect={$settings.sections.components.chart.parameterSelect === 'always' ||
            $settings.sections.components.chart.parameterSelect === 'overview'}
          onclick={() => dayView.open(timebucket)}
        />
      </div>
    </FailSafeContainer>
  {/if}
{:else}
  <Skeleton class="h-2 w-full" />
  <Skeleton class="h-[25vh] w-full" />
  <Skeleton class="h-[max(20vh,12rem)] w-full" />
{/if}
