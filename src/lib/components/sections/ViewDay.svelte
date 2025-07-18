<script lang="ts">
  import * as Drawer from '$lib/components/ui/drawer'
  import { forecastStore } from '$lib/stores/data'
  import { NOW } from '$lib/stores/now'
  import { selectedDay } from '$lib/stores/selectedDay'
  import { DateTime } from 'luxon'
  import { Button } from '../ui/button'
  import { ChevronLeft, ChevronRight, ThermometerIcon } from '@lucide/svelte'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import ParameterDaySummary from '../weather/ParameterDaySummary.svelte'
  import type { WeatherMetricKey } from '$lib/types/data'
  import type { ParameterDaySummaryProps } from '$lib/types/ui'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { coordinates } from '$lib/stores/location'
  import TimelineBar from '../TimelineBar.svelte'
  import { settings } from '$lib/settings/store'
  import { persistantState } from '$lib/utils/state.svelte'
  import type { today } from '@internationalized/date'
  import { Skeleton } from '../ui/skeleton'
  import WeatherChart from '../weather/WeatherChart.svelte'

  const isToday = $derived.by(() => {
    if (!$forecastStore || !$selectedDay) return false
    return $selectedDay.datetime.startOf('day').equals($NOW.startOf('day'))
  })

  const dayLabel = $derived.by(() => {
    if (!$selectedDay) return 'Today'
    if (isToday) return 'Today, ' + $selectedDay.datetime.toLocaleString(DateTime.DATE_FULL)
    return $selectedDay.datetime.toLocaleString(DateTime.DATE_HUGE)
  })

  const currentIndex = $derived.by(() => {
    if (!$forecastStore || !$selectedDay) return -1
    return $forecastStore.daily.findIndex((d) => d.datetime.equals($selectedDay.datetime))
  })

  function navigateBy(delta: number) {
    if (currentIndex === -1) return
    const target = $forecastStore?.daily[currentIndex + delta]
    if (!target) return
    selectedDay.set(target)
  }
  function navigateToToday() {
    const target = $forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day')))
    if (!target) return
    selectedDay.set(target)
  }

  const parameterConfigs: Record<WeatherMetricKey, ParameterDaySummaryProps> = {
    temperature: { useTotalAsDomain: true },
    pressure: {},
    relative_humidity: {},
    cloud_coverage: {},
    wind_speed: {},
    precipitation_amount: {},
    // cape: {},
    // cin: {},
    // grad: {},
  }

  function handleSwipe(event: SwipeCustomEvent) {
    switch (event.detail.direction) {
      case 'right':
        navigateBy(-1)
        break
      case 'left':
        navigateBy(1)
        break
      case 'top':
        navigateToToday()
        break
    }
  }

  let visibleSeries = persistantState<WeatherMetricKey[]>('chart-parameters-visible', [
    'temperature',
    'precipitation_amount',
    'cloud_coverage',
  ])
</script>

<Drawer.Root
  bind:open={
    () => $selectedDay !== null,
    (o) => {
      if (!o) selectedDay.set(null)
    }
  }
>
  <Drawer.Content class="">
    <div
      class="flex h-full flex-col gap-4 overflow-y-auto p-4"
      use:swipe={() => ({ timeframe: 200, minSwipeDistance: 30 })}
      onswipe={handleSwipe}
    >
      <header class="flex justify-between gap-4 text-xl font-bold">
        <Button size="icon" variant="outline" onclick={() => navigateBy(-1)} disabled={currentIndex === 0}>
          <ChevronLeft />
        </Button>
        <Button variant={isToday ? 'outline' : 'secondary'} class="grow" onclick={navigateToToday}>
          {dayLabel}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onclick={() => navigateBy(1)}
          disabled={currentIndex === $forecastStore?.daily.length - 1}
        >
          <ChevronRight />
        </Button>
      </header>

      <TimelineBar
        multiseries={$selectedDay?.multiseries}
        startDatetime={$selectedDay?.datetime.startOf('day')}
        endDatetime={$selectedDay?.datetime.endOf('day')}
        parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
        marks={$settings.sections.components.timelineBar.marks.map((m) => $selectedDay?.datetime.set(m))}
        coordinates={$coordinates}
        datetime={$NOW}
        className="h-2"
      />

      <div class="bg-midground flex h-fit flex-col gap-2 rounded-lg p-2">
        {#if $selectedDay}
          <WeatherChart
            multiseries={$selectedDay.multiseries}
            visibleSeries={visibleSeries.value}
            startDateTime={$selectedDay.datetime}
            endDateTime={$selectedDay.datetime.plus($selectedDay.duration)}
            datetime={$NOW}
            className="snap-center shrink-0 w-full h-[20vh]"
          />
        {:else}
          <Skeleton class="h-full w-full" />
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        {#each Object.entries(parameterConfigs) as [parameter, config]}
          <ParameterDaySummary {...config} {parameter} day={$selectedDay} />
        {/each}
      </div>
    </div>
    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  </Drawer.Content>
</Drawer.Root>
