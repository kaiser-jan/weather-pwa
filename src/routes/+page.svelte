<script lang="ts">
  import * as Drawer from '$lib/components/ui/drawer/index.js'
  import type { Coordinates, Forecast } from '$lib/types/data'
  import NumberRangeBar from '$lib/components/NumberRangeBar.svelte'
  import TimelineBar from '$lib/components/TimelineBar.svelte'
  import { ArrowRightIcon, Divide, DropletsIcon, LucideSettings, RefreshCwIcon, UmbrellaIcon } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { cn, formatRelativeDatetime } from '$lib/utils'
  import { DateTime } from 'luxon'
  import PwaSettings from '$lib/components/pwa/PWASettings.svelte'
  import { loadForecast } from '$lib/data/providers'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { placeToWeatherLocation as formatPlaceAsWeatherLocation, reverseGeocoding } from '$lib/data/location'
  import { deriveWeatherSituationFromInstant, deriveWeatherSituationFromPeriod } from '$lib/data/symbols'
  import WeatherSymbol from '$lib/components/weather/WeatherSymbol.svelte'
  import { onMount, tick } from 'svelte'
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import { groupMultiseriesByDay } from '$lib/data/utils'
  import DailyWeatherCharts from '$lib/components/weather/DailyWeatherCharts.svelte'
  import SettingsRenderer from '$lib/settings/components/SettingsRenderer.svelte'
  import { settingsConfig } from '$lib/settings/config'
  import SettingsView from '$lib/settings/components/SettingsView.svelte'

  let data = $state<Partial<Forecast>>()

  let locationName = $state<string>()
  let isLoading = $state(false)
  let coordinates = $state<Coordinates>()

  $effect(() => {
    if (coordinates) {
      loadForecastData()

      reverseGeocoding(coordinates).then((placeOutput) => {
        locationName = formatPlaceAsWeatherLocation(placeOutput)
      })
    }
  })

  async function loadForecastData() {
    if (!coordinates) {
      console.warn(`Unable to load data, no coordinates.`)
      return
    }

    isLoading = true

    data = await loadForecast(coordinates, $settings.datasets)

    // show the spinning even when using cache
    setTimeout(() => (isLoading = false), 500)
  }

  const multiseriesByDay = $derived(data?.multiseries ? groupMultiseriesByDay(data?.multiseries) : undefined)

  function getMultiseriesForDate(targetDate: DateTime) {
    if (!multiseriesByDay) return undefined
    const result = multiseriesByDay.findLast((tp) => tp.datetime <= targetDate)
    const series = result?.series ?? multiseriesByDay[0].series
    return series
  }

  // TODO: reactivity
  const precipitationStartDatetime = $derived.by(() => {
    const precipitation_amount = data?.multiseries?.precipitation_amount
    if (!precipitation_amount) return undefined

    // the first time period with precipitation from now on
    const timePeriodWithPrecipitation = precipitation_amount.find((tp, index) => {
      if (tp.value === undefined) return false
      // also allow the current timebucket -> it is already raining
      const isCurrentTimeBucket = precipitation_amount[index + 1].datetime > DateTime.now()
      if (tp.datetime < DateTime.now() && !isCurrentTimeBucket) return false
      return tp.value > $settings.weather.precipitation.threshold
    })

    return timePeriodWithPrecipitation?.datetime
  })

  const precipitationEndDatetime = $derived.by(() => {
    if (!data?.multiseries?.precipitation_amount || !precipitationStartDatetime) return undefined

    // the first time period without precipitation after the precipitationStartDatetime
    const timePeriodWithoutPrecipitation = data.multiseries.precipitation_amount.find((tp) => {
      if (tp.value === undefined || tp.datetime < precipitationStartDatetime) return false
      return tp.value <= $settings.weather.precipitation.threshold
    })

    return timePeriodWithoutPrecipitation?.datetime
  })

  onMount(() => {
    loadForecastData()
  })
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->
<div
  class="flex w-full flex-col items-center justify-center rounded-b-[1rem] bg-blue-950 p-[0.5rem] pt-0"
  style="height: calc(30vh + max(0.5rem, env(safe-area-inset-top)))"
>
  <div class="shrink-0" style="height: max(0.5rem, env(safe-area-inset-top))"></div>
  <div class="text-text-muted inline-flex w-full items-center justify-between text-xs">
    {locationName}
    <button onclick={loadForecastData} class={['p-2', isLoading ? 'animate-spin' : '']}>
      <RefreshCwIcon />
    </button>
  </div>

  {#if data?.current}
    <div class="my-auto flex flex-row items-center justify-center gap-4">
      <WeatherSymbol
        className="size-30"
        derived={deriveWeatherSituationFromInstant(data.current)}
        provided={data.current.symbol}
        {coordinates}
      />
      <span class="text-6xl">{Math.round(data.current.temperature)}°C</span>
    </div>

    <div class="bg-background flex w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
      <WeatherItemCurrent item="cloud_coverage" current={data.current} />
      <WeatherItemCurrent item="uvi" current={data.current} />
      <WeatherItemCurrent item="wind" current={data.current} />
      {#if precipitationStartDatetime}
        <span class="inline-flex items-center gap-2">
          <UmbrellaIcon />
          {#if precipitationStartDatetime > DateTime.now()}
            {formatRelativeDatetime(precipitationStartDatetime)}
          {:else if precipitationEndDatetime}
            <span class="inline-flex flex-row items-center">
              <ArrowRightIcon class="text-text-muted" />
              {formatRelativeDatetime(precipitationEndDatetime)}
            </span>
          {:else}
            now
          {/if}
        </span>
      {/if}
      {#if data.current.precipitation_amount && data.current.precipitation_amount > 0}
        <WeatherItemCurrent item="precipitation_amount" current={data.current} />
      {/if}
    </div>
  {/if}
</div>

<div class="flex flex-col gap-4 p-4">
  {#if getMultiseriesForDate(DateTime.now())}
    <TimelineBar
      multiseries={getMultiseriesForDate(DateTime.now())!}
      parameters={['temperature']}
      startDatetime={DateTime.now().startOf('day')}
      endDatetime={DateTime.now().startOf('day').plus({ days: 1 })}
      marks={$settings.dashboard.timelineBar.marks.map((m) => DateTime.now().set(m))}
      {coordinates}
      className="h-2"
    />
  {/if}

  {#if multiseriesByDay}
    <DailyWeatherCharts dailyMultiseries={multiseriesByDay} />
  {/if}

  <div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
    {#each data?.daily ?? [] as day}
      <div class="inline-flex flex-row items-center justify-between gap-2">
        <span class="w-[3ch]">{day.datetime.toFormat('ccc')}</span>

        <div class="flex w-[40%] gap-2">
          {#if getMultiseriesForDate(day.datetime)}
            <TimelineBar
              multiseries={getMultiseriesForDate(day.datetime)}
              startDatetime={day.datetime.startOf('day')}
              endDatetime={day.datetime.endOf('day')}
              parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
              marks={$settings.dashboard.timelineBar.marks.map((m) => day.datetime.set(m))}
              {coordinates}
              className="h-2"
            />
          {:else}
            <WeatherSymbol className="size-6" derived={deriveWeatherSituationFromPeriod(day)} {coordinates} />
            <!-- TODO: unify this with WeatherItemCurrent, add other values -->
            {#if day.summary.precipitation_amount?.sum && day.summary.precipitation_amount.sum >= 1}
              <span class="inline-flex items-center gap-1 text-blue-200">
                <DropletsIcon />
                {Math.round(day.summary.precipitation_amount.sum)}mm
              </span>
            {/if}
          {/if}
        </div>

        <div class="flex w-[40%] items-center gap-2">
          <span class="w-[2ch]">{Math.round(day.summary.temperature.min)}</span>
          <NumberRangeBar
            total={data?.total?.summary.temperature}
            instance={day.summary.temperature}
            color="temperature"
            className="h-2 w-full"
          />
          <span class="w-[2ch]">{Math.round(day.summary.temperature.max)}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- NOTE: bottom navbar overlap padding -->
  <div class="h-16"></div>

  <div
    class="from-background via-background/80 absolute right-0 bottom-0 left-0 flex h-30 flex-row gap-2 bg-gradient-to-t to-transparent"
  ></div>
  <div class="absolute right-6 bottom-6 left-6 z-20 flex flex-row gap-2">
    <LocationSelector bind:coordinates />

    <Drawer.Root open={true}>
      <Drawer.Trigger
        class={cn(buttonVariants({ variant: 'midground', size: 'icon' }), 'size-14! grow-0 rounded-full text-lg!')}
      >
        <LucideSettings />
      </Drawer.Trigger>
      <Drawer.Content class="h-full w-full">
        <div class="flex w-full flex-col gap-4 p-4">
          <h2 class="text-xl font-bold">PWA Options</h2>
          <PwaSettings />
          <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
        </div>

        <SettingsView config={settingsConfig} path={[]} />
      </Drawer.Content>
    </Drawer.Root>
  </div>
</div>
