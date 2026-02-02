<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { ChevronLeftIcon, HistoryIcon, MapPinnedIcon, PencilIcon, PlayIcon, SearchIcon, XIcon } from '@lucide/svelte'
  import { settings } from '$lib/stores/settings'
  import { iconMap } from '$lib/utils/icons'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { ITEM_ID_GEOLOCATION, ITEM_ID_TEMPORARY } from '$lib/types/ui'
  import { selectedLocation } from '$lib/stores/location'
  import { page } from '$app/state'
  import { locationSearch, openSettingsAt } from '$lib/stores/ui'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import { persisted } from 'svelte-persisted-store'
  import LocationItem from './LocationItem.svelte'

  const geolocationDetails = geolocationStore.details

  let currentQuery = $state<string | null>(page.state.locationQuery)
  let searchNow = $state<() => void>(() => {})

  const savedLocations = settings.select((s) => s.data.locations)
</script>

<h1 class="text-bold flex flex-row items-center gap-2 text-xl">
  <MapPinnedIcon class="shrink-0" />
  Locations
</h1>
<div class="flex grow flex-col gap-4">
  <LocationItem
    type="geolocation"
    item={{
      id: ITEM_ID_GEOLOCATION,
      icon: $geolocationDetails.icon,
      label: 'Geolocation',
      sublabel: $geolocationDetails.geocoding?.display_name,
      coordinates: undefined,
      select: () => {
        selectedLocation.set({ type: 'geolocation' })
        locationSearch.hide()
      },
    }}
    disabled={$geolocationDetails.stateCategory === 'failed'}
  />

  <h5 class="-mb-3 text-sm text-text-muted">Saved Locations</h5>
  <div class={['flex min-h-10 shrink-0 flex-col justify-center gap-0 rounded-md bg-midground']}>
    {#each $savedLocations as location, index (location.id)}
      {#if index !== 0}
        <span class=" mx-auto h-0.5 w-full bg-background"></span>
      {/if}
      <LocationItem
        type="saved"
        item={{
          id: location.id,
          icon: iconMap[location.icon],
          label: location.name,
          coordinates: location,
          select: () => {
            selectedLocation.set({ type: 'saved', location })
            locationSearch.hide()
          },
        }}
      />
    {:else}
      <span class="px-2 py-1 text-text">
        Save a searched location or your current geolocation for it to show up here.
      </span>
    {/each}
  </div>

  {#if $selectedLocation?.type === 'search'}
    <h5 class="-mb-3 text-sm text-text-muted">From Search</h5>
    <LocationItem
      type="search"
      item={{
        id: ITEM_ID_TEMPORARY,
        icon: $selectedLocation.icon,
        label: $selectedLocation.label,
        sublabel: $selectedLocation.sublabel,
        coordinates: undefined,
        select: locationSearch.hide,
      }}
      disabled={$geolocationDetails.stateCategory === 'failed'}
    />
  {/if}

  <Button variant="outline" onclick={() => openSettingsAt(['data', 'locations'])}>
    <PencilIcon /> Edit saved locations
  </Button>
</div>
