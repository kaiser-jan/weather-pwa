<script lang="ts">
  import { MapPinIcon, NavigationIcon, NavigationOffIcon, SearchIcon } from 'lucide-svelte'
  import { CONFIG } from '$lib/config'
  import { Button } from './ui/button'
  import type { Coordinates } from '$lib/types/data'
  import type { env } from '$env/dynamic/private'
  import { createGeolocationStore } from '$lib/stores/geolocation'
  import { persistantState } from '$lib/utils/state.svelte'
  import { get } from 'svelte/store'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'

  let selectedItemId = persistantState('selected-location-id', -1)

  interface Props {
    coordinates: Coordinates
  }

  let { coordinates = $bindable() }: Props = $props()

  let locationName = 'TODO: locationName'

  $effect(() => {
    if (selectedItemId.value === -1) {
      const coords = get(geolocation).position?.coords
      if (!coords) return
      coordinates = coords
    } else coordinates = CONFIG.locations[selectedItemId.value]
  })

  let useGeolocation = persistantState('use-geolocation', true)

  const { store: geolocation, refresh: updateGeolocation } = createGeolocationStore({
    watch: false,
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 0,
  })

  // TODO: properly handle data when switching location
  // TODO: add a placeholder page when geolocation is unavailable

  geolocation.subscribe((g) => {
    if (!useGeolocation.value || !g.position) return
    if (selectedItemId.value === -1) coordinates = g.position.coords
    // loadForecastData()
  })

  // TODO: extrcact and make globally available

  let geolocationStateDetails = $derived.by((): { icon: typeof NavigationIcon | null; label: string | undefined } => {
    const ERROR_LABELS: Record<number, string> = {
      [GeolocationPositionError.TIMEOUT]: 'Timed Out',
      [GeolocationPositionError.PERMISSION_DENIED]: 'Denied',
      [GeolocationPositionError.POSITION_UNAVAILABLE]: 'Unavailable',
    } as const

    switch ($geolocation.status) {
      case 'unstarted':
      case 'requesting':
      case 'loading':
        return { icon: null, label: 'Loading...' }
      case 'unsupported':
      case 'unpermitted':
      case 'error':
        const error = $geolocation.error?.code as keyof typeof ERROR_LABELS | null
        return { icon: NavigationOffIcon, label: error ? ERROR_LABELS[error] : 'Error' }
      case 'active':
        return { icon: NavigationIcon, label: locationName }
    }
  })
</script>

<div class="flex grow flex-row items-center gap-1">
  <div class="bg-midground flex flex-row gap-2 rounded-l-full p-2">
    <button
      class={[
        'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
        selectedItemId.value === -1 ? 'bg-primary' : 'bg-foreground text-text-d',
      ]}
      onclick={() => (selectedItemId.value = -1)}
    >
      {#if geolocationStateDetails.icon}
        <geolocationStateDetails.icon class="-mb-0.5 -ml-0.5" />
      {:else}
        <LoaderPulsatingRing className="size-4" />
      {/if}
    </button>
  </div>
  <div class="bg-midground relative w-1 grow">
    <div class="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-2">
      {#each CONFIG.locations as location, locationId}
        <button
          class={[
            'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
            selectedItemId.value === locationId ? 'bg-primary' : 'bg-foreground text-text-muted',
          ]}
          onclick={() => (selectedItemId.value = locationId)}
        >
          {#if location.icon}
            <location.icon />
          {:else}
            {location.name}
          {/if}
        </button>
      {/each}
    </div>
    <div class="to-midground absolute top-0 right-0 h-full w-6 bg-gradient-to-r from-transparent"></div>
  </div>
  <div class="bg-midground flex flex-row gap-2 rounded-r-full p-2">
    <Button disabled variant="midground" size="icon" class="size-10 rounded-full text-xl">
      <SearchIcon />
    </Button>
  </div>
</div>
