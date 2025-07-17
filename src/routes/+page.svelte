<script lang="ts">
  import type { Coordinates, WeatherMetricKey } from '$lib/types/data'
  import { ArrowRightIcon, RefreshCwIcon, UmbrellaIcon } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { DateTime } from 'luxon'
  import { placeToWeatherLocation as formatPlaceAsWeatherLocation, reverseGeocoding } from '$lib/data/location'
  import { deriveWeatherSituationFromInstant } from '$lib/data/symbols'
  import WeatherSymbol from '$lib/components/weather/WeatherSymbol.svelte'
  import { onDestroy, onMount } from 'svelte'
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import { forecastStore } from '$lib/stores/data'
  import SettingsButton from '$lib/components/SettingsButton.svelte'
  import SectionChartDaily from '$lib/components/sections/SectionChartDaily.svelte'
  import AsyncText from '$lib/components/AsyncText.svelte'
  import SkySimulation from '$lib/components/SkySimulation.svelte'
  import { currentFromMultiseries } from '$lib/data/utils'
  import SectionDailyDetails from '$lib/components/sections/SectionDailyDetails.svelte'
  import SectionDailyOutlook from '$lib/components/sections/SectionDailyOutlook.svelte'
  import NoticePrecipitation from '$lib/components/weather/notices/NoticePrecipitation.svelte'

  let locationName = $state<string>()
  let isLoading = $state(false)
  let coordinates = $state<Coordinates>()
  let NOW = $state(DateTime.now())

  const settingData = settings.select((s) => s.data)

  const ITEMS_CURRENT: WeatherMetricKey[] = ['relative_humidity', 'wind_speed', 'pressure']

  const forecastCurrent = $derived.by(() => {
    if (!$forecastStore) return null
    if ($forecastStore.current) return $forecastStore.current
    return currentFromMultiseries($forecastStore.multiseries, NOW)
  })

  $effect(() => {
    // auto refresh
    if (coordinates && NOW) {
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

  function onMinuteChange() {
    NOW = DateTime.now()
    scheduleNextMinuteChange()
  }

  function scheduleNextMinuteChange() {
    const millisecondsUntilNextMinute = 60 * 1000 - DateTime.now().second * 1000 - DateTime.now().millisecond
    setTimeout(onMinuteChange, millisecondsUntilNextMinute)
  }

  // Start the first schedule
  scheduleNextMinuteChange()

  let updateDateTimeInterval: ReturnType<typeof setInterval>
  onMount(() => {
    updateDateTimeInterval = setInterval(() => (NOW = DateTime.now()), 60 * 1000)
  })

  onDestroy(() => {
    clearInterval(updateDateTimeInterval)
  })
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->
<div
  class="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-b-[1rem] bg-blue-950 p-[0.5rem] pt-0"
  style="height: calc(30vh + max(0.5rem, env(safe-area-inset-top)))"
>
  <SkySimulation class="absolute inset-0 z-0" {coordinates} turbidity={4} datetime={NOW} />

  <div class="shrink-0" style="height: max(0.5rem, env(safe-area-inset-top))"></div>

  <div class="text-text z-10 inline-flex w-full items-center justify-between text-xs">
    <span class="drop-shadow-c-md">{locationName}</span>
    <button onclick={loadForecastData} class={['p-2', isLoading ? 'animate-spin' : '']}>
      <RefreshCwIcon />
    </button>
  </div>

  <div class="z-10 my-auto flex flex-row items-center justify-center gap-4">
    <WeatherSymbol
      className="size-30 z-10"
      derived={deriveWeatherSituationFromInstant(forecastCurrent)}
      provided={forecastCurrent}
      {coordinates}
      datetime={NOW}
    />
    <!-- TODO: units -->
    <AsyncText
      class="drop-shadow-c-md text-6xl"
      text={Math.round(forecastCurrent?.temperature) + '°C'}
      placeholder={'20°C'}
      loaded={forecastCurrent !== null}
    />
  </div>

  <div class="bg-background z-10 flex h-10 w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
    {#each ITEMS_CURRENT as item}
      <WeatherItemCurrent {item} current={forecastCurrent} />
    {/each}
  </div>
</div>

<div class="flex flex-col gap-4 p-4">
  <NoticePrecipitation datetime={NOW} />

  <SectionChartDaily datetime={NOW} />

  <SectionDailyDetails {coordinates} datetime={NOW} />

  <SectionDailyOutlook {coordinates} datetime={NOW} />

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
