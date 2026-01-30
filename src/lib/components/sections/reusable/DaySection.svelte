<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW, NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import { useSwipe } from 'svelte-gestures'
  import { settings } from '$lib/stores/settings'
  import { dayView } from '$lib/stores/ui'
  import { METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { ChevronRightIcon, ClockIcon } from '@lucide/svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import { coordinates } from '$lib/stores/location'
  import TimelineBar from '$lib/components/visualization/TimelineBar.svelte'
  import ParameterDaySummary from '$lib/components/weather/ParameterDaySummary.svelte'
  import type { TimeBucket } from '$lib/types/data'
  import { getStartOfDayTimestamp } from '$lib/utils'

  interface Props {
    timebucket: TimeBucket | undefined
    metrics: ForecastMetric[]
    title: string
    icon: typeof ChevronRightIcon
    showChart: boolean
    showSummary: boolean
  }

  let { timebucket, metrics = $bindable(), title, icon, showChart, showSummary }: Props = $props()

  function openThisDay() {
    if (!timebucket) return
    const thisDay = $forecastStore?.daily.find((d) => d.timestamp === getStartOfDayTimestamp(timebucket.timestamp))
    if (!thisDay) return
    dayView.open(thisDay)
  }
  function openNextDay() {
    if (!timebucket) return
    const nextDay = $forecastStore?.daily.find(
      (d) => d.timestamp === getStartOfDayTimestamp(timebucket.timestamp + 24 * 3600 * 1000),
    )
    if (!nextDay) return
    dayView.open(nextDay)
  }
</script>

<SectionTitle {title} {icon} onclick={openThisDay}>
  <ChevronRightIcon class="ml-auto" />
</SectionTitle>

{#if timebucket}
  <TimelineBar
    multiseries={timebucket.multiseries}
    startTimestamp={timebucket.timestamp}
    endTimestamp={timebucket.timestamp + timebucket.duration}
    parameters={['sun', 'cloud_coverage', 'rain_amount', 'snow_amount']}
  />

  {#if showSummary}
    <FailSafeContainer
      name={`Section ${title}`}
      class="container flex w-full flex-col flex-wrap justify-between gap-x-4 gap-y-2 rounded-lg"
      onclick={openThisDay}
    >
      <div class="flex flex-row flex-wrap justify-between gap-4">
        {#each $settings.sections.today.metrics as metric (metric)}
          {@const config = METRIC_DETAILS[metric].summary}
          <div class="flex flex-row flex-nowrap items-center gap-2">
            <ParameterDaySummary {...config} {metric} day={timebucket} />
          </div>
        {/each}
      </div>
    </FailSafeContainer>
  {/if}

  {#if showChart}
    <FailSafeContainer name={`Section ${title} Chart`} class="container">
      <div
        class="flex w-full flex-col flex-wrap justify-between gap-x-4 gap-y-2"
        {...useSwipe(
          (e) => {
            if (e.detail.direction === 'left') openNextDay()
          },
          () => ({ touchAction: 'pan-y' }),
        )}
      >
        <WeatherChart
          multiseries={timebucket.multiseries}
          parameters={metrics}
          startTimestamp={timebucket.timestamp}
          endTimestamp={timebucket.timestamp + timebucket.duration}
          className="h-[max(20vh,12rem)]"
          location="overview"
          onclick={openThisDay}
        />
      </div>
    </FailSafeContainer>
  {/if}
{:else}
  <Skeleton class="h-2 w-full" />
  <Skeleton class="h-[25vh] w-full" />
  <Skeleton class="h-[max(20vh,12rem)] w-full" />
{/if}
