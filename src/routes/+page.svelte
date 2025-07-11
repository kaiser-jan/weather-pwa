<script lang="ts">
  import type { Coordinates, Forecast } from '$lib/types/data'
  import NumberRangeBar from '$lib/components/NumberRangeBar.svelte'
  import TimelineBar from '$lib/components/TimelineBar.svelte'
  import { ArrowRightIcon, Divide, DropletsIcon, LucideSettings, RefreshCwIcon, UmbrellaIcon } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { cn, formatRelativeDatetime } from '$lib/utils'
  import { DateTime } from 'luxon'
  import { placeToWeatherLocation as formatPlaceAsWeatherLocation, reverseGeocoding } from '$lib/data/location'
  import { deriveWeatherSituationFromInstant, deriveWeatherSituationFromPeriod } from '$lib/data/symbols'
  import WeatherSymbol from '$lib/components/weather/WeatherSymbol.svelte'
  import { onMount, tick } from 'svelte'
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import { groupMultiseriesByDay } from '$lib/data/utils'
  import { forecastStore } from '$lib/stores/data'
  import SettingsButton from '$lib/components/SettingsButton.svelte'
  import SectionDaily from '$lib/components/sections/SectionDaily.svelte'
  import SectionChartDaily from '$lib/components/sections/SectionChartDaily.svelte'

  let locationName = $state<string>()
  let isLoading = $state(false)
  let coordinates = $state<Coordinates>()

  const settingData = settings.select((s) => s.data)

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

    forecastStore.update(coordinates, $settingData.datasets, $settingData.incrementalLoad)

    // show the spinning even when using cache
    setTimeout(() => (isLoading = false), 500)
  }

  const today = $derived($forecastStore?.daily.findLast((d) => d.datetime <= DateTime.now()))

  // TODO: reactivity
  const precipitationStartDatetime = $derived.by(() => {
    const precipitation_amount = $forecastStore?.multiseries?.precipitation_amount
    if (!precipitation_amount) return undefined

    // the first time period with precipitation from now on
    const timePeriodWithPrecipitation = precipitation_amount.find((tp, index) => {
      if (tp.value === undefined) return false
      // also allow the current timebucket -> it is already raining
      const isCurrentTimeBucket = precipitation_amount[index + 1].datetime > DateTime.now()
      if (tp.datetime < DateTime.now() && !isCurrentTimeBucket) return false
      return tp.value > $settings.data.forecast.precipitation.threshold
    })

    return timePeriodWithPrecipitation?.datetime
  })

  const precipitationEndDatetime = $derived.by(() => {
    if (!$forecastStore?.multiseries?.precipitation_amount || !precipitationStartDatetime) return undefined

    // the first time period without precipitation after the precipitationStartDatetime
    const timePeriodWithoutPrecipitation = $forecastStore.multiseries.precipitation_amount.find((tp) => {
      if (tp.value === undefined || tp.datetime < precipitationStartDatetime) return false
      return tp.value <= $settings.data.forecast.precipitation.threshold
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

  {#if $forecastStore?.current}
    <div class="my-auto flex flex-row items-center justify-center gap-4">
      <WeatherSymbol
        className="size-30"
        derived={deriveWeatherSituationFromInstant($forecastStore.current)}
        provided={$forecastStore.current.symbol}
        {coordinates}
      />
      <span class="text-6xl">{Math.round($forecastStore.current.temperature)}°C</span>
    </div>

    <div class="bg-background flex w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
      <WeatherItemCurrent item="cloud_coverage" current={$forecastStore.current} />
      <WeatherItemCurrent item="uvi" current={$forecastStore.current} />
      <WeatherItemCurrent item="wind" current={$forecastStore.current} />
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
      {#if $forecastStore.current.precipitation_amount && $forecastStore.current.precipitation_amount > 0}
        <WeatherItemCurrent item="precipitation_amount" current={$forecastStore.current} />
      {/if}
    </div>
  {/if}
</div>

<div class="flex flex-col gap-4 p-4">
  {#if today}
    <TimelineBar
      multiseries={today.multiseries}
      parameters={['temperature']}
      startDatetime={DateTime.now().startOf('day')}
      endDatetime={DateTime.now().startOf('day').plus({ days: 1 })}
      marks={$settings.sections.components.timelineBar.marks.map((m) => DateTime.now().set(m))}
      {coordinates}
      className="h-2"
    />
  {/if}

  <SectionChartDaily />

  <SectionDaily {coordinates} />

  <!-- NOTE: bottom navbar overlap padding -->
  <div class="h-16"></div>

  <div
    class="from-background via-background/80 absolute right-0 bottom-0 left-0 flex h-30 flex-row gap-2 bg-gradient-to-t to-transparent"
  ></div>
  <div class="absolute right-6 bottom-6 left-6 z-20 flex flex-row gap-2">
    <LocationSelector bind:coordinates />
    <SettingsButton />
  </div>
</div>
