<script lang="ts">
  import * as Drawer from '$lib/components/ui/drawer/index.js'
  import * as env from '$env/static/public'
  import { Switch } from '$lib/components/ui/switch'
  import type { Forecast } from '$lib/types/data'
  import NumberRangeBar from '$lib/components/NumberRangeBar.svelte'
  import TimelineBar from '$lib/components/TimelineBar.svelte'
  import { ArrowRightIcon, LucideSettings, MapPinIcon, NavigationIcon, UmbrellaIcon } from 'lucide-svelte'
  import { CONFIG } from '$lib/scripts/config'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { formatRelativeDatetime } from '$lib/utils'
  import { DateTime } from 'luxon'
  import PwaSettings from '$lib/components/pwa/PWASettings.svelte'
  import { providers, type ProviderId } from '$lib/scripts/data/forecast/providers'
  import SelectAutoString from '$lib/components/SelectAutoString.svelte'
  import { Button } from '$lib/components/ui/button'
  import { placeToWeatherLocation as formatPlaceAsWeatherLocation, reverseGeocoding } from '$lib/scripts/location'
  import { createGeolocationStore } from '$lib/stores/geolocation'

  let data = $state<Forecast>()
  let providerId = $state<ProviderId>('geosphere.at')
  let locationName = $state<string>()

  // TODO: extract the localstorage middleware
  let useGeolocation = $state(localStorage.getItem('use-geolocation') !== 'false')
  $effect(() => localStorage.setItem('use-geolocation', useGeolocation ? 'true' : 'false'))

  const { store: geolocation, refresh: updateGeolocation } = createGeolocationStore({
    watch: false,
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 0,
  })

  // TODO: properly handle data when switching location
  // TODO: add a placeholder page when geolocation is unavailable

  geolocation.subscribe((g) => {
    if (!useGeolocation || !g.position) return
    loadForecastData()
  })

  $effect(() => {
    if (!useGeolocation) loadForecastData()
  })

  const dummyCoordinates = {
    latitude: parseFloat(env.PUBLIC_LATITUDE) ?? 0,
    longitude: parseFloat(env.PUBLIC_LONGITUDE) ?? 0,
    altitude: parseFloat(env.PUBLIC_ALTITUDE) ?? 0,
  }

  async function loadForecastData() {
    // exit early if geolocation is still loading
    // TODO: warn about location errors - should this be done by subscribing to the geolocation store?
    if (useGeolocation && ['unstarted', 'requesting', 'loading'].includes($geolocation.status)) return

    const coordinates = useGeolocation ? $geolocation.position?.coords : dummyCoordinates
    if (!coordinates) {
      console.warn(`Unable to load data for ${useGeolocation ? 'geolocation' : 'fixed location'}, no coordinates.`)
      return
    }

    console.log(providerId)
    // TODO: make altitude nullable
    data = await providers[providerId].load(coordinates)
    console.log(data)
    const placeOutput = await reverseGeocoding(coordinates)
    locationName = formatPlaceAsWeatherLocation(placeOutput)
  }

  function startOfDate(date: Date = new Date()) {
    const copy = new Date(date)
    copy.setHours(0, 0, 0, 0)
    return copy
  }
  function endOfDate(date: Date = new Date()) {
    const copy = new Date(date)
    copy.setHours(24, 0, 0, 0)
    return copy
  }

  function getHourlyForDate(targetDate: Date) {
    if (!data) return []
    return data.hourly.filter((hour) => {
      const d = hour.datetime
      return (
        d.getFullYear() === targetDate.getFullYear() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getDate() === targetDate.getDate()
      )
    })
  }

  const precipitationStartDatetime = $derived.by(() => {
    const hourWithPrecipitation = data?.hourly.find((h) => {
      if (h.precipitation_amount === undefined) return false
      return h.precipitation_amount > CONFIG.weather.precipitation.threshold
    })

    if (!hourWithPrecipitation) return undefined
    return DateTime.fromJSDate(hourWithPrecipitation.datetime)
  })

  const precipitationEndDatetime = $derived.by(() => {
    const hourWithoutPrecipitation = data?.hourly.find((h) => {
      if (h.precipitation_amount === undefined) return false
      return h.precipitation_amount <= CONFIG.weather.precipitation.threshold
    })

    if (!hourWithoutPrecipitation) return undefined
    return DateTime.fromJSDate(hourWithoutPrecipitation.datetime)
  })

  loadForecastData()
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->
<div class="flex h-[30vh] w-full flex-col items-center justify-center rounded-b-[1rem] bg-blue-950 p-[0.5rem]">
  <button class="text-text-muted mr-auto inline-flex items-center gap-1 text-xs" onclick={updateGeolocation}>
    {#if useGeolocation}
      <NavigationIcon />
    {:else}
      <MapPinIcon />
    {/if}
    <span>{locationName}</span>
  </button>

  {#if data?.current}
    <div class="my-auto">
      <span class="text-6xl">{Math.round(data.current.temperature)}°C</span>
    </div>

    <div class="bg-background flex w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
      <WeatherItemCurrent item="cloud_coverage" {data} />
      <WeatherItemCurrent item="uvi" {data} />
      <WeatherItemCurrent item="wind" {data} />
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
        <WeatherItemCurrent item="precipitation_amount" {data} />
      {/if}
    </div>
  {/if}
</div>

<div class="flex flex-col gap-4 p-4">
  <TimelineBar
    hourly={getHourlyForDate(new Date())}
    className="h-2"
    parameters={['temperature']}
    startDatetime={startOfDate()}
  />

  <div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
    {#each data?.daily ?? [] as day}
      <div class="inline-flex flex-row items-center justify-between gap-2">
        <span class="w-[3ch]">{new Date(day.datetime).toLocaleDateString(undefined, { weekday: 'short' })}</span>

        {#if getHourlyForDate(day.datetime)}
          <TimelineBar
            hourly={getHourlyForDate(day.datetime)}
            startDatetime={startOfDate(day.datetime)}
            endDatetime={endOfDate(day.datetime)}
            parameters={['uvi_clear_sky', 'cloud_coverage', 'precipitation_amount', 'wind_speed']}
            className="h-2 w-[40%]!"
          />
        {/if}

        <div class="flex w-[40%] items-center gap-2">
          <span class="w-[2ch]">{Math.round(day.temperature.min)}</span>
          <NumberRangeBar
            total={data?.total.temperature}
            instance={day.temperature}
            color="temperature"
            className="h-2 w-full"
          />
          <span class="w-[2ch]">{Math.round(day.temperature.max)}</span>
        </div>
      </div>
    {/each}
  </div>

  <Drawer.Root>
    <Drawer.Trigger asChild let:builder>
      <Button
        builders={[builder]}
        variant="default"
        size="icon"
        class="absolute right-8 bottom-8 size-16! grow-0 rounded-full"
      >
        <LucideSettings class="size-8!" />
      </Button>
    </Drawer.Trigger>
    <Drawer.Content>
      <div class="flex w-full flex-col gap-4 p-4">
        <h2 class="text-xl font-bold">Weather Data</h2>
        <SelectAutoString items={Object.keys(providers)} bind:selected={providerId} />
        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-2">
            <Switch bind:checked={useGeolocation} />
            Use geolocation
          </div>
        </div>
        <h2 class="text-xl font-bold">PWA Options</h2>
        <PwaSettings />
      </div>
    </Drawer.Content>
  </Drawer.Root>
</div>
