<script lang="ts">
  import * as Drawer from '$lib/components/ui/drawer'
  import { forecastStore } from '$lib/stores/data'
  import { NOW, NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
  import { DateTime } from 'luxon'
  import { Button } from '$lib/components/ui/button'
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'
  import ParameterDaySummary from '$lib/components/weather/ParameterDaySummary.svelte'
  import type { ForecastParameter } from '$lib/types/data'
  import type { ParameterDaySummaryProps } from '$lib/types/ui'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { coordinates } from '$lib/stores/location'
  import TimelineBar from '$lib/components/visualization/TimelineBar.svelte'
  import { settings } from '$lib/settings/store'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import { cn, getEndOfDayTimestamp, getStartOfDayTimestamp, toggle } from '$lib/utils'
  import { page } from '$app/state'
  import { dayView } from '$lib/stores/ui'
  import { FORECAST_METRICS, METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import ExpandableList from '$lib/components/ExpandableList.svelte'
  import ParameterToggle from '$lib/components/weather/ParameterToggle.svelte'

  // TODO: 0 should be today
  const dayIndex = $derived(parseInt(page.url.searchParams.get('dayIndex') ?? '0'))

  const selectedDay = $derived($forecastStore?.daily?.[dayIndex])

  const isToday = $derived.by(() => {
    if (!$forecastStore || !selectedDay) return false
    return getStartOfDayTimestamp(selectedDay.timestamp) === $TODAY_MILLIS
  })

  const dayLabel = $derived.by(() => {
    if (!selectedDay) return 'Today'
    if (isToday) return 'Today, ' + DateTime.fromMillis(selectedDay.timestamp).toLocaleString(DateTime.DATE_MED)
    return DateTime.fromMillis(selectedDay.timestamp).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
  })

  const currentIndex = $derived.by(() => {
    if (!$forecastStore || !selectedDay) return -1
    return $forecastStore.daily.findIndex((d) => d.timestamp === selectedDay.timestamp)
  })

  function navigateToToday() {
    const target = $forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS)
    if (!target) return
    dayView.select(target)
  }

  function handleSwipe(event: SwipeCustomEvent) {
    switch (event.detail.direction) {
      case 'right':
        dayView.previous()
        break
      case 'left':
        dayView.next()
        break
    }
  }

  const visibleMetrics = dayView.visibleMetrics
</script>

<main
  class="flex grow flex-col justify-start overflow-x-hidden overflow-y-auto scroll-smooth"
  use:swipe={() => ({ touchAction: 'pan-y' })}
  onswipe={handleSwipe}
>
  <div class="shrink-0" style="height: calc(env(safe-area-inset-top) + 5rem)"></div>
  <header
    class="bg-background border-muted absolute top-0 z-10 flex h-[calc(4.5rem+env(safe-area-inset-top))] w-full justify-between gap-4 border-b-2 p-4 pt-[calc(1rem+env(safe-area-inset-top))] text-xl font-bold"
  >
    <Button size="icon" variant="midground" onclick={() => dayView.previous()} disabled={currentIndex === 0}>
      <ChevronLeft />
    </Button>
    <Button variant={isToday ? 'ghost' : 'midground'} class="grow overflow-hidden" onclick={navigateToToday}>
      {dayLabel}
    </Button>
    <Button
      size="icon"
      variant="midground"
      onclick={() => dayView.next()}
      disabled={currentIndex === $forecastStore!.daily.length - 1}
    >
      <ChevronRight />
    </Button>
  </header>

  <section class="flex flex-col gap-4 px-4 pt-2 pb-0">
    {#if selectedDay}
      <TimelineBar
        multiseries={selectedDay.multiseries}
        startTimestamp={getStartOfDayTimestamp(selectedDay.timestamp)}
        endTimestamp={getEndOfDayTimestamp(selectedDay.timestamp)}
        parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
        marks={$settings.sections.components.timelineBar.marks.map((m) =>
          DateTime.fromMillis(selectedDay!.timestamp).set(m),
        )}
        coordinates={$coordinates}
        datetime={$NOW_MILLIS}
        className="h-2"
      />

      <div class="bg-midground flex h-fit flex-col gap-2 rounded-lg p-2" data-vaul-no-drag>
        {#if selectedDay}
          <WeatherChart
            multiseries={selectedDay.multiseries}
            parameters={$visibleMetrics}
            startTimestamp={getStartOfDayTimestamp(selectedDay.timestamp)}
            endTimestamp={selectedDay.timestamp + selectedDay.duration}
            timestamp={$NOW_MILLIS}
            className="snap-center shrink-0 w-full h-[30vh]"
            hideYAxes={$settings.sections.components.chart.showYAxes === 'never'}
          />
        {:else}
          <Skeleton class="h-full w-full" />
        {/if}
      </div>

      <div class="-mt-2 min-h-0 grow overflow-y-auto pt-2">
        <ExpandableList
          items={FORECAST_METRICS}
          visibleItems={$settings.data.forecast.metrics}
          markedItems={$visibleMetrics}
          contentClass="gap-2"
        >
          {#snippet itemSnippet(metric)}
            <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
          {/snippet}

          {#snippet children(metrics: ForecastMetric[])}
            <div class="flex flex-row flex-wrap gap-2">
              {#each metrics as metric (metric)}
                {@const config = METRIC_DETAILS[metric].summary}

                <ParameterToggle {metric} bind:visibleList={$visibleMetrics}>
                  <ParameterDaySummary {...config} {metric} day={selectedDay} fullDay />
                </ParameterToggle>
              {/each}
            </div>
          {/snippet}
        </ExpandableList>
      </div>
    {/if}
  </section>
</main>
