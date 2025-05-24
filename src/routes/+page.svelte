<script lang="ts">
  import { env } from '$env/dynamic/public'
  import { Switch } from '$lib/components/ui/switch'
  import { loadForecast } from '$lib/scripts/data/forecast'
  import type { Coordinates } from '$lib/types/data'
  import type { Forecast } from '$lib/types/data'
  import { toast } from 'svelte-sonner'
  import dummyData from '$lib/scripts/data/forecast/test-data.json'
  import NumberRangeBar from '$lib/components/NumberRangeBar.svelte'
  import DayColorBar from '$lib/components/DayColorBar.svelte'
  import { UmbrellaIcon } from 'lucide-svelte'
  import { CONFIG } from '$lib/scripts/config'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { formatRelativeDatetime } from '$lib/utils'

  // TODO: transform data to a provider-independent format
  let data = $state<Forecast>()
  let useDummyLocation = $state(true)
  let useDummyData = $state(true)

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onCurrentPosition, onPositionError, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 0,
    })
  }

  async function onCurrentPosition(position: GeolocationPosition) {
    await loadForecastData({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude ?? 0,
    })
  }

  function onPositionError(positionError: GeolocationPositionError) {
    toast.error('Failed to get Geolocation!', { description: positionError.message })
  }

  $effect(() => {
    if (!useDummyData) return
    data = { ...dummyData }
    console.log(dummyData)
  })

  $effect(() => {
    if (!useDummyLocation || useDummyData) return
    if (env.PUBLIC_LATITUDE === undefined || env.PUBLIC_LONGITUDE === undefined || env.PUBLIC_ALTITUDE === undefined)
      return

    loadForecastData({
      latitude: parseFloat(env.PUBLIC_LATITUDE),
      longitude: parseFloat(env.PUBLIC_LONGITUDE),
      altitude: parseFloat(env.PUBLIC_ALTITUDE),
    })
  })

  async function loadForecastData(coords: Coordinates) {
    data = await loadForecast(coords, 'met.no')
    console.log(data)
    // console.log(JSON.stringify(data))
  }

  let tomorrowHourly = $derived.by(() => {
    if (!data?.hourly) return []
    const tomorrowMidnight = new Date()
    tomorrowMidnight.setHours(0, 0, 0, 0)
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1)
    const startIndex = data.hourly.findIndex((h) => new Date(h.datetime).getTime?.() > tomorrowMidnight.getTime())
    return data?.hourly.slice(startIndex, (startIndex ?? 0) + 23)
  })

  const precipitationAtDatetime = $derived(
    data?.hourly.find((h) =>
      h.precipitation_amount ? h.precipitation_amount > CONFIG.weather.precipitation.threshold : false,
    )?.datetime,
  )
</script>

<div class="flex h-[30vh] w-full flex-col items-center justify-center rounded-b-[1rem] bg-blue-950 p-[0.5rem]">
  {#if data?.current}
    <div class="my-auto">
      <span class="text-6xl">{Math.round(data.current.temperature)}°C</span>
    </div>

    <div class="bg-background flex w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
      <WeatherItemCurrent item="cloud_coverage" {data} />
      <WeatherItemCurrent item="uvi" {data} />
      <WeatherItemCurrent item="wind" {data} />
      <span class="inline-flex items-center gap-2">
        <UmbrellaIcon class="size-[1em]" />
        {formatRelativeDatetime(precipitationAtDatetime)}
      </span>
    </div>
  {/if}
</div>

<div class="flex flex-col gap-4 p-4">
  <DayColorBar hourly={tomorrowHourly} className="h-2" />
  <div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
    {#each data?.daily ?? [] as day}
      <div class="inline-flex flex-row items-center justify-between gap-2">
        <span class="w-[3ch]">{new Date(day.datetime).toLocaleDateString?.(undefined, { weekday: 'short' })}</span>

        <NumberRangeBar
          total={{ min: 0, max: 1 }}
          instance={day.cloud_coverage}
          color="clouds"
          className="h-2 w-[10%]"
        />

        <span class="text-blue-200">{Math.round(day.precipitation_amount.sum)}mm</span>

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

  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <Switch bind:checked={useDummyLocation} />
      Use dummy location
    </div>
    <div class="flex flex-row gap-2">
      <Switch bind:checked={useDummyData} />
      Use dummy data
    </div>
  </div>
</div>
