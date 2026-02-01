<script lang="ts">
  import { geolocationStore } from '$lib/stores/geolocation'
  import { BookmarkIcon, ChevronRight, Trash2Icon, type Icon } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
  import { settings } from '$lib/stores/settings'
  import { getDistanceBetweenCoordinatesMeters, type Item } from '$lib/utils/location'
  import { locationSearch } from '$lib/stores/ui'
  import { deleteSavedLocation, saveLocation } from '$lib/utils/location'
  import { selectedLocation, type LocationSelection } from '$lib/stores/location'

  interface Props {
    item: Item
    type: LocationSelection['type']
    disabled?: boolean
  }

  let { item, type, disabled }: Props = $props()

  const saved = $derived(
    $settings.data.locations.find(
      (l) => l.latitude === item.coordinates?.latitude && l.longitude === item.coordinates?.longitude,
    ),
  )

  const active = $derived(
    $selectedLocation?.type === type &&
      ($selectedLocation?.type !== 'saved' || $selectedLocation?.location.id === item.id),
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
  class="flex h-fit! flex-row items-center justify-between gap-2 p-2 text-base"
  onclick={item.select}
  {disabled}
>
  <div class="flex min-w-0 flex-col">
    <div class="flex min-w-0 flex-row items-center gap-2">
      {#if item.icon}
        <item.icon class="shrink-0" />
      {:else}
        <LoaderPulsatingRing className="size-5" />
        <!-- <MapPinIcon class="text-text-muted shrink-0" /> -->
      {/if}
      <span class="overflow-hidden text-ellipsis">{item.label}</span>
    </div>
    <span class="min-w-0 overflow-hidden text-left text-xs text-wrap text-ellipsis text-text-muted">
      {item.sublabel}
    </span>
  </div>
  <div class="flex flex-row items-center gap-2">
    {#if $geolocationStore.position?.coords && item?.coordinates}
      <span class="text-text-muted">
        {formatDistance(
          getDistanceBetweenCoordinatesMeters($geolocationStore.position.coords, {
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude,
            altitude: null,
          }),
        )}
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
