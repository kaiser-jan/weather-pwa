<script lang="ts">
  import type { Coordinates } from '$lib/types/data'
  import TimelineBar from '$lib/components/TimelineBar.svelte'
  import { ArrowRightIcon, RefreshCwIcon, UmbrellaIcon } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { formatRelativeDatetime } from '$lib/utils'
  import { DateTime } from 'luxon'
  import { placeToWeatherLocation as formatPlaceAsWeatherLocation, reverseGeocoding } from '$lib/data/location'
  import { deriveWeatherSituationFromInstant } from '$lib/data/symbols'
  import WeatherSymbol from '$lib/components/weather/WeatherSymbol.svelte'
  import { onMount } from 'svelte'
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import { forecastStore } from '$lib/stores/data'
  import SettingsButton from '$lib/components/SettingsButton.svelte'
  import SectionDaily from '$lib/components/sections/SectionDaily.svelte'
  import SectionChartDaily from '$lib/components/sections/SectionChartDaily.svelte'
  import AsyncText from '$lib/components/AsyncText.svelte'
  import SkySimulation from '$lib/components/SkySimulation.svelte'

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
    console.debug(`Requesting forecast data update`)

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
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->
<div
  class="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-b-[1rem] bg-blue-950 p-[0.5rem] pt-0"
  style="height: calc(30vh + max(0.5rem, env(safe-area-inset-top)))"
>
  <SkySimulation class="absolute inset-0 z-0" {coordinates} turbidity={4} datetime={DateTime.now()} />

  <div class="shrink-0" style="height: max(0.5rem, env(safe-area-inset-top))"></div>

  <div class="text-text-muted z-10 inline-flex w-full items-center justify-between text-xs">
    <span class="drop-shadow-2xl">{locationName}</span>
    <button onclick={loadForecastData} class={['p-2', isLoading ? 'animate-spin' : '']}>
      <RefreshCwIcon />
    </button>
  </div>

  <div class="z-10 my-auto flex flex-row items-center justify-center gap-4">
    <WeatherSymbol
      className="size-30 z-10"
      derived={deriveWeatherSituationFromInstant($forecastStore?.current)}
      provided={$forecastStore?.current?.symbol}
      {coordinates}
    />
    <!-- TODO: units -->
    <AsyncText
      class="text-6xl drop-shadow-2xl"
      text={Math.round($forecastStore?.current?.temperature) + '°C'}
      placeholder={'20°C'}
      loaded={$forecastStore?.current !== undefined}
    />
  </div>

  <div class="bg-background z-10 flex h-10 w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
    <WeatherItemCurrent item="cloud_coverage" current={$forecastStore?.current} />
    <WeatherItemCurrent item="uvi" current={$forecastStore?.current} />
    <WeatherItemCurrent item="wind" current={$forecastStore?.current} />
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
    {#if $forecastStore?.current?.precipitation_amount && $forecastStore.current.precipitation_amount > 0}
      <WeatherItemCurrent item="precipitation_amount" current={$forecastStore.current} />
    {/if}
  </div>
</div>

<div class="flex flex-col gap-4 p-4">
  <TimelineBar
    multiseries={today?.multiseries}
    parameters={['temperature']}
    startDatetime={DateTime.now().startOf('day')}
    endDatetime={DateTime.now().startOf('day').plus({ days: 1 })}
    marks={$settings.sections.components.timelineBar.marks.map((m) => DateTime.now().set(m))}
    {coordinates}
    className="h-2"
  />

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
