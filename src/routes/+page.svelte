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
      latitude: parseInt(env.PUBLIC_LATITUDE),
      longitude: parseInt(env.PUBLIC_LONGITUDE),
      altitude: parseInt(env.PUBLIC_ALTITUDE),
    })
  })

  async function loadForecastData(coords: Coordinates) {
    data = await loadForecast(coords, 'metno')
    console.log(data)
    // console.log(JSON.stringify(data))
  }

  let hourlyTomorrow = $derived.by(() => {
    if (!data?.hourly) return []
    const tomorrowMidnight = new Date()
    tomorrowMidnight.setHours(0, 0, 0, 0)
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1)
    console.log(tomorrowMidnight)
    data.hourly.forEach((h) => console.log(h.datetime))
    const startIndex = data.hourly.findIndex((h) => new Date(h.datetime).getTime?.() > tomorrowMidnight.getTime())
    console.log()
    return data?.hourly.slice(startIndex, (startIndex ?? 0) + 23)
  })
</script>

<div class="h-[30vh] w-full rounded-b-xl bg-blue-950">
  {Math.round(data?.current?.temperature)}°C
  {Math.round(data?.current?.cloud_coverage)}%
  {Math.round(data?.current?.uvi_clear_sky)}
  {Math.round(data?.current?.wind_speed)}
  {Math.round(data?.current?.wind_degrees)}
  {data?.hourly.find((h) => h.precipitation_amount > 0)?.datetime}
  <!-- {data.current.cloud_coverage} -->
</div>

<div class="flex flex-col gap-4 p-4">
  <!-- {#each data?.hourly as hour} -->
  <!--   {hour?.temperature} -->
  <!-- {/each} -->
  <div class="h-2">
    <DayColorBar hourly={hourlyTomorrow} />
  </div>
  <div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
    {#each data?.daily ?? [] as day}
      <div class="inline-flex flex-row items-center gap-2">
        <span class="w-[3ch]">{new Date(day.datetime).toLocaleDateString?.(undefined, { weekday: 'short' })}</span>

        <div class="grow"></div>

        <div class="h-2 w-[10%]">
          <NumberRangeBar total={data?.total.cloud_coverage} instance={day.cloud_coverage} color="clouds" />
        </div>
        <span class="text-blue-200">{Math.round(day.precipitation_amount.sum)}mm</span>

        <div class="grow"></div>

        <span class="w-[2ch]">{Math.round(day.temperature.min)}</span>
        <div class="h-2 w-[30%]">
          <NumberRangeBar total={data.total.temperature} instance={day.temperature} color="temperature" />
        </div>
        <span class="w-[2ch]">{Math.round(day.temperature.max)}</span>
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
