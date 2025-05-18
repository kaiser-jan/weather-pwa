<script lang="ts">
  import { env } from '$env/dynamic/public'
  import { Switch } from '$lib/components/ui/switch'
  import { loadForecast } from '$lib/scripts/data/forecast'
  import type { Coordinates } from '$lib/types/data'
  import type { Forecast } from '$lib/types/data'
  import { toast } from 'svelte-sonner'
  import dummyData from '$lib/scripts/data/forecast/test-data.json'

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
    data = dummyData
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
  }
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
  {#each data?.hourly as hour}
    {hour?.temperature}
  {/each}
  {#each data?.daily as day}
    {day?.temperature.avg}
  {/each}

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
