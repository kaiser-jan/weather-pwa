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
  import ExpandableList from '../ExpandableList.svelte'

  const selectedDay = $derived($forecastStore?.daily?.[page.state.selectedDayIndex])

  const isToday = $derived.by(() => {
    if (!$forecastStore || !selectedDay) return false
    return getStartOfDayTimestamp(selectedDay.timestamp) === $TODAY_MILLIS
  })

  const dayLabel = $derived.by(() => {
    if (!selectedDay) return 'Today'
    if (isToday) return 'Today, ' + DateTime.fromMillis(selectedDay.timestamp).toLocaleString(DateTime.DATE_FULL)
    return DateTime.fromMillis(selectedDay.timestamp).toLocaleString(DateTime.DATE_HUGE)
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

  // TODO: integrate to metrics config
  const metricConfigs: Partial<Record<ForecastParameter, ParameterDaySummaryProps>> = {
    temperature: { useTotalAsDomain: true },
    precipitation_amount: { items: ['icon', 'precipitation-groups'] },
    relative_humidity: {},
    wind_speed: { items: ['icon', 'avg', 'max'] },
    pressure: { items: ['icon', 'avg', 'trend'] },
    cloud_coverage: { items: ['icon', 'avg'] },
    cape: { items: ['icon', 'avg', 'max'] },
    cin: { items: ['icon', 'max'] },
    grad: { items: ['icon', 'max'] },
    pm25: { items: ['icon', 'avg', 'max'] },
    pm10: { items: ['icon', 'avg', 'max'] },
    o3: { items: ['icon', 'avg', 'max'] },
    no2: { items: ['icon', 'avg', 'max'] },
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

<Drawer.Root
  bind:open={
    () => page.state.selectedDayIndex !== undefined,
    (open) => {
      if (!open) {
        dayView.hide()
      }
    }
  }
>
  <Drawer.Content class="">
    <div
      class="bg-background relative flex h-full min-h-0 flex-col gap-4 p-4 py-0"
      use:swipe={() => ({ touchAction: 'pan-y' })}
      onswipe={handleSwipe}
    >
      <!-- BUG: the sticky header causes a 1px height w-full line, which bleeds through the siblings scrolled below  -->
      <!-- it was tried to e.g. put an absolute position element on top, but nothing seems to help -->
      <header class="bg-background/80 sticky top-0 z-10 -mb-2 flex justify-between gap-4 py-2 text-xl font-bold">
        <Button size="icon" variant="outline" onclick={() => dayView.previous()} disabled={currentIndex === 0}>
          <ChevronLeft />
        </Button>
        <Button variant={isToday ? 'ghost' : 'outline'} class="grow" onclick={navigateToToday}>
          {dayLabel}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onclick={() => dayView.next()}
          disabled={currentIndex === $forecastStore!.daily.length - 1}
        >
          <ChevronRight />
        </Button>
      </header>

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
            />
          {:else}
            <Skeleton class="h-full w-full" />
          {/if}
        </div>

        <div class="border-foreground -mt-2 min-h-0 grow overflow-y-auto border-t-2 pt-2">
          <ExpandableList
            items={FORECAST_METRICS}
            visibleItems={$settings.sections.views.day.metrics}
            markedItems={$visibleMetrics}
          >
            {#snippet itemSnippet(metric)}
              <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
            {/snippet}

            {#snippet children(metrics: ForecastMetric[])}
              <div class="flex flex-row flex-wrap gap-2">
                {#each metrics as metric (metric)}
                  {@const config = metricConfigs[metric]}
                  <ParameterDaySummary
                    {...config}
                    parameter={metric}
                    day={selectedDay}
                    selected={$visibleMetrics.includes(metric)}
                    onclick={() => visibleMetrics.set(toggle($visibleMetrics, metric))}
                  />
                {/each}
              </div>
            {/snippet}
          </ExpandableList>
        </div>
      {/if}
    </div>
    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  </Drawer.Content>
</Drawer.Root>
