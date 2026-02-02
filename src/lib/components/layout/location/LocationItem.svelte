<script lang="ts">
  import { geolocationStore } from '$lib/stores/geolocation'
  import { BookmarkIcon, ChevronRight, MapPinIcon, Trash2Icon, type Icon } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
  import { settings } from '$lib/stores/settings'
  import { getDistanceBetweenCoordinatesMeters } from '$lib/utils/location'
  import { locationSearch } from '$lib/stores/ui'
  import { selectedLocation, selectedLocationDetails, type LocationSelection } from '$lib/stores/location'
  import { type LocationItemDetails } from '$lib/types/ui'
  import { deleteSavedLocation, saveLocation } from '$lib/utils/savedLocations'

  interface Props {
    item: LocationItemDetails
    type: LocationSelection['type']
    icon?: typeof Icon | null
    loading?: boolean
    disabled?: boolean
    select: () => void
  }

  let { item, icon: ItemIcon, type, loading, disabled, select }: Props = $props()

  const saved = $derived(
    $settings.data.locations.find((l) => l?.latitude === item?.latitude && l?.longitude === item?.longitude),
  )

  const active = $derived(
    $selectedLocationDetails?.latitude === item?.latitude && $selectedLocationDetails?.longitude === item?.longitude,
  )

  function formatDistance(meters: number | null) {
    if (meters === null) return null
    // TODO: bugfix: respect unit setting
    if (meters > 1000) {
      return (meters / 1000).toFixed(meters > 10_000 ? 0 : 1) + 'km'
    }
    return Math.round(meters) + 'm'
  }
</script>

<Button
  variant={active ? 'default' : 'midground'}
  class="flex h-fit min-h-12 flex-row items-center justify-between gap-2 p-2 text-base"
  onclick={select}
  {disabled}
>
  <div class="flex min-w-0 flex-col">
    <div class="flex min-w-0 flex-row items-center gap-2">
      {#if ItemIcon}
        <ItemIcon class="shrink-0" />
      {:else if loading}
        <LoaderPulsatingRing className="size-5" />
      {:else}
        <MapPinIcon class="shrink-0 text-text-muted" />
      {/if}
      <span class="overflow-hidden text-ellipsis">{item.name}</span>
    </div>
    <span class="min-w-0 overflow-hidden text-left text-xs text-wrap text-ellipsis text-text-muted">
      {item.geocoding?.display_name}
    </span>
  </div>
  <div class="flex flex-row items-center gap-2">
    {#if $geolocationStore.position?.coords}
      <span class="text-text-muted">
        {formatDistance(getDistanceBetweenCoordinatesMeters($geolocationStore.position.coords, item))}
      </span>
    {/if}
    {#if !disabled}
      {#if saved}
        <Button
          size="icon"
          variant="outline"
          class="size-8"
          onclick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            deleteSavedLocation(item)
          }}
        >
          <Trash2Icon />
        </Button>
      {:else}
        <Button
          size="icon"
          variant="outline"
          class="size-8"
          onclick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            saveLocation(item)

            locationSearch.hide()
          }}
        >
          <BookmarkIcon />
        </Button>
      {/if}
      <ChevronRight />
    {/if}
  </div>
</Button>
