<script lang="ts">
  import * as Drawer from '$lib/components/ui/drawer'
  import { forecastStore } from '$lib/stores/data'
  import { NOW } from '$lib/stores/now'
  import { DateTime } from 'luxon'
  import { Button } from '$lib/components/ui/button'
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'
  import ParameterDaySummary from '$lib/components/weather/ParameterDaySummary.svelte'
  import type { ForecastParameter } from '$lib/types/data'
  import type { ParameterDaySummaryProps } from '$lib/types/ui'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { coordinates } from '$lib/stores/location'
  import TimelineBar from '$lib/components/TimelineBar.svelte'
  import { settings } from '$lib/settings/store'
  import { persistantState } from '$lib/utils/state.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import WeatherChart from '$lib/components/weather/WeatherChart.svelte'
  import { cn, toggle } from '$lib/utils'
  import { page } from '$app/state'
  import { dayView } from '$lib/stores/ui'

  const selectedDay = $derived(
    $forecastStore?.daily?.find((d) => d.datetime.toISO() === page.state.selectedDayDatetime),
  )

  const isToday = $derived.by(() => {
    if (!$forecastStore || !selectedDay) return false
    return selectedDay.datetime.startOf('day').equals($NOW.startOf('day'))
  })

  const dayLabel = $derived.by(() => {
    if (!selectedDay) return 'Today'
    if (isToday) return 'Today, ' + selectedDay.datetime.toLocaleString(DateTime.DATE_FULL)
    return selectedDay.datetime.toLocaleString(DateTime.DATE_HUGE)
  })

  const currentIndex = $derived.by(() => {
    if (!$forecastStore || !selectedDay) return -1
    return $forecastStore.daily.findIndex((d) => d.datetime.equals(selectedDay.datetime))
  })

  function navigateToToday() {
    const target = $forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day')))
    if (!target) return
    dayView.select(target)
  }

  const parameterConfigs: Partial<Record<ForecastParameter, ParameterDaySummaryProps>> = {
    temperature: { useTotalAsDomain: true },
    precipitation_amount: { items: ['icon', 'precipitation-groups'] },
    relative_humidity: {},
    wind_speed: { items: ['icon', 'avg', 'max'] },
    pressure: { items: ['icon', 'avg', 'trend'] },
    cloud_coverage: { items: ['icon', 'avg'] },
    cape: { items: ['icon', 'avg', 'max'] },
    cin: { items: ['icon', 'max'] },
    grad: { items: ['icon', 'max'] },
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

  let visibleSeries = persistantState<ForecastParameter[]>('view-day-chart-parameters', [
    'temperature',
    'precipitation_amount',
    'cloud_coverage',
  ])
</script>

<Drawer.Root
  bind:open={
    () => Boolean(page.state.selectedDayDatetime),
    (o) => {
      if (!o) dayView.hide()
    }
  }
>
  <Drawer.Content class="">
    <div
      class="bg-background relative flex h-full flex-col gap-4 overflow-y-auto p-4 pt-0"
      use:swipe={() => ({ touchAction: 'pan-y' })}
      onswipe={handleSwipe}
    >
      <!-- BUG: the sticky header causes a 1px height w-full line, which bleeds through the siblings scrolled below  -->
      <!-- it was tried to e.g. put an absolute position element on top, but nothing seems to help -->
      <header class="bg-background/80 sticky top-0 z-10 -mb-2 flex justify-between gap-4 py-4 text-xl font-bold">
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
          startDatetime={selectedDay.datetime.startOf('day')}
          endDatetime={selectedDay.datetime.endOf('day')}
          parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
          marks={$settings.sections.components.timelineBar.marks.map((m) => selectedDay!.datetime.set(m))}
          coordinates={$coordinates}
          datetime={$NOW}
          className="h-2"
        />

        <div class="bg-midground flex h-fit flex-col gap-2 rounded-lg p-2" data-vaul-no-drag>
          {#if selectedDay}
            <WeatherChart
              multiseries={selectedDay.multiseries}
              parameters={visibleSeries.value}
              startDateTime={selectedDay.datetime}
              endDateTime={selectedDay.datetime.plus(selectedDay.duration)}
              datetime={$NOW}
              className="snap-center shrink-0 w-full h-[30vh]"
            />
          {:else}
            <Skeleton class="h-full w-full" />
          {/if}
        </div>

        <div class="flex flex-row flex-wrap gap-2">
          {#each Object.entries(parameterConfigs) as [parameter, config] (parameter)}
            {@const parameterTyped = parameter as ForecastParameter}
            {#if selectedDay.summary[parameterTyped]}
              <button
                class={cn(
                  'bg-background relative flex h-fit grow flex-row items-center gap-2 overflow-hidden rounded-lg border-2 py-2 pr-2.5 pl-3.5',
                  visibleSeries.value.includes(parameterTyped) ? 'bg-midground border-midground' : '',
                )}
                style={`width: ${!config.items || config.items?.includes('range-bar') || config.items?.includes('precipitation-groups') ? 100 : 40}%`}
                onclick={() => toggle(visibleSeries.value, parameter)}
              >
                <ParameterDaySummary
                  {...config}
                  parameter={parameterTyped}
                  day={selectedDay}
                  selected={visibleSeries.value.includes(parameterTyped)}
                />
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  </Drawer.Content>
</Drawer.Root>
