<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { BookmarkIcon, MapPinnedIcon, PencilIcon, PlayIcon, RotateCwIcon } from '@lucide/svelte'
  import { settings } from '$lib/stores/settings'
  import { iconMap } from '$lib/utils/icons'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { locationGeolocation, selectedLocation, selectGeolocation, selectSavedLocation } from '$lib/stores/location'
  import { locationSearch, openSettingsAt } from '$lib/stores/ui'
  import LocationItem from './LocationItem.svelte'

  const geolocationDetails = geolocationStore.details

  const savedLocations = settings.select((s) => s.data.locations)
</script>

<h1 class="text-bold flex flex-row items-center gap-2 text-xl">
  <MapPinnedIcon class="shrink-0" />
  Locations
</h1>
<div class="flex grow flex-col gap-4">
  <h5 class="-mb-4 flex w-full items-center justify-between text-sm text-text-muted">
    <span>Geolocation</span>
    <Button
      variant="ghost"
      onclick={geolocationStore.refresh}
      disabled={$geolocationDetails.stateCategory === 'loading'}
    >
      {#if $geolocationDetails.stateCategory === 'active'}
        <PlayIcon /> Start
      {:else}
        <RotateCwIcon /> Refresh
      {/if}
    </Button>
  </h5>
  <LocationItem
    type="geolocation"
    icon={$geolocationDetails.icon}
    item={$locationGeolocation}
    select={() => {
      selectGeolocation()
      locationSearch.hide()
    }}
    loading={$geolocationDetails.stateCategory === 'loading'}
    disabled={$geolocationDetails.stateCategory === 'failed' || $geolocationDetails.stateCategory === 'loading'}
  />

  <h5 class="-mb-4 flex w-full items-center justify-between text-sm text-text-muted">
    Saved Locations
    <Button
      variant="ghost"
      onclick={() => openSettingsAt(['data', 'locations'])}
      disabled={$geolocationDetails.stateCategory === 'loading'}
    >
      <PencilIcon /> Edit
    </Button>
  </h5>
  <div class="flex min-h-10 shrink-0 flex-col justify-center gap-0.5">
    {#each $savedLocations as location, index (location.id)}
      {#if index !== 0}
        <span class=" mx-auto h-0.5 w-full bg-background"></span>
      {/if}
      <LocationItem
        type="saved"
        item={location}
        icon={location.icon ? iconMap[location.icon] : undefined}
        select={() => {
          selectSavedLocation(location.id)
          locationSearch.hide()
        }}
      />
    {:else}
      <span class="text-text text-sm">
        Save
        <BookmarkIcon class="inline -mt-0.5 text-text" />
        a searched location or your current geolocation for it to show up here.
      </span>
    {/each}
  </div>

  {#if $selectedLocation?.type === 'search'}
    <h5 class="-mb-3 text-sm text-text-muted">From Search</h5>
    <LocationItem
      type="search"
      item={$selectedLocation.item}
      select={locationSearch.hide}
      disabled={$geolocationDetails.stateCategory === 'failed'}
    />
  {/if}
</div>
