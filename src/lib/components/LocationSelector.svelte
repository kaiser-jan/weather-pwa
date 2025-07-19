<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { Coordinates } from '$lib/types/data'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { persistantState } from '$lib/utils/state.svelte'
  import { get } from 'svelte/store'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import LocationSearch from './LocationSearch.svelte'
  import { iconMap } from '$lib/utils/icons'
  import { onMount } from 'svelte'
  import { coordinates } from '$lib/stores/location'

  const geolocationDetails = geolocationStore.details

  const ITEM_ID_GEOLOCATION = -1
  const ITEM_ID_TEMPORARY = -2

  let selectedItemId = persistantState('selected-location-id', ITEM_ID_GEOLOCATION)
  const previouslySelectedCoordinates = persistantState<Coordinates | null>('selected-coordinates', null)

  interface Props {}

  let {}: Props = $props()

  const settingLocations = settings.select((s) => s.data.locations)

  $effect(() => {
    if (selectedItemId.value === ITEM_ID_GEOLOCATION) {
      const coords = get(geolocationStore).position?.coords
      if (!coords) return
      coordinates.set(coords)
    } else if (selectedItemId.value === ITEM_ID_TEMPORARY) {
    } else {
      const details = $settingLocations[Math.min(selectedItemId.value, $settingLocations.length - 1)]
      coordinates.set({ longitude: details.longitude, latitude: details.latitude, altitude: details.altitude })
    }
  })

  let useGeolocation = persistantState('use-geolocation', true)

  // TODO: properly handle data when switching location
  // TODO: add a placeholder page when geolocation is unavailable

  geolocationStore.subscribe((g) => {
    if (!useGeolocation.value || !g.position) return
    if (selectedItemId.value === ITEM_ID_GEOLOCATION) coordinates.set(g.position.coords)
    // loadForecastData()
  })
</script>

<div class="flex grow flex-row items-center gap-1">
  <div class="bg-midground flex flex-row gap-2 rounded-l-full p-2">
    <button
      class={[
        'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
        selectedItemId.value === ITEM_ID_GEOLOCATION ? 'bg-primary' : 'bg-foreground text-text-d',
      ]}
      onclick={() => {
        geolocationStore.refresh()
        selectedItemId.value = ITEM_ID_GEOLOCATION
      }}
    >
      {#if $geolocationDetails.icon}
        {@const Icon = $geolocationDetails.icon}
        <Icon class={['-mb-0.5 -ml-0.5', $geolocationDetails.class]} />
      {:else}
        <LoaderPulsatingRing className="size-4" />
      {/if}
    </button>
  </div>
  <div class="bg-midground relative w-1 grow">
    <div class="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-2">
      {#each $settingLocations as location, locationId}
        <button
          class={[
            'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
            selectedItemId.value === locationId ? 'bg-primary' : 'bg-foreground text-text-muted',
          ]}
          onclick={() => (selectedItemId.value = locationId)}
        >
          {#if location.icon}
            {@const Icon = iconMap[location.icon]}
            <Icon />
          {:else}
            {location.name}
          {/if}
        </button>
      {/each}
    </div>
    <div class="to-midground absolute top-0 right-0 h-full w-6 bg-gradient-to-r from-transparent"></div>
  </div>
  <div class="bg-midground flex flex-row gap-2 rounded-r-full p-2">
    <!-- TODO: always use geolocation -->
    <LocationSearch
      active={selectedItemId.value === ITEM_ID_TEMPORARY}
      onselect={(s) => {
        if ('index' in s) {
          selectedItemId.value = s.index
        } else {
          coordinates.set(s.coordinates)
          previouslySelectedCoordinates.value = s.coordinates
          selectedItemId.value = ITEM_ID_TEMPORARY
        }
      }}
    />
  </div>
</div>
