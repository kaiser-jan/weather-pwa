<script lang="ts">
  import { geolocationStore } from '$lib/stores/geolocation'
  import type { Coordinates } from '$lib/types/data'
  import { BookmarkIcon, ChevronRight, MapPinIcon, Trash2Icon, type Icon } from '@lucide/svelte'
  import { Button } from './ui/button'
  import { ITEM_ID_GEOLOCATION, type LocationSelection } from '$lib/types/ui'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import { settings } from '$lib/settings/store'
  import { get } from 'svelte/store'
  import { createUUID } from '$lib/utils'

  type Item = {
    id: string
    icon: typeof Icon | null
    label: string
    sublabel?: string
    coordinates?: Coordinates
  }

  interface Props {
    title: string
    onselect: (s: LocationSelection) => void
    selectById?: boolean
    loading?: boolean
    placeholderEmpty?: string
    placeholderNull?: string
    placeholderLoading?: string
    disabled?: boolean
    items: Item[] | null
  }

  let {
    title,
    items,
    selectById,
    onselect = $bindable(),
    loading,
    placeholderEmpty,
    placeholderLoading,
    placeholderNull,
    disabled,
  }: Props = $props()

  function distanceMeters(a: Coordinates | null, b: Coordinates | null): number | null {
    if (!a || !b) return null
    const R = 6371000 // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(b.latitude - a.latitude)
    const dLon = toRad(b.longitude - a.longitude)
    const x =
      Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    return R * c
  }

  function formatDistance(meters: number | null) {
    if (meters === null) return null
    // TODO: respect unit setting
    if (meters > 1000) {
      return (meters / 1000).toFixed(meters > 10_000 ? 0 : 1) + 'km'
    }
    return Math.round(meters) + 'm'
  }

  function getSavedLocationFor(item: Item) {
    return $settings.data.locations.find(
      (l) => l.latitude === item.coordinates?.latitude && l.longitude === item.coordinates?.longitude,
    )
  }

  function deleteSavedLocation(item: Item) {
    // TODO: this is made to be forgotten when changing this setting
    const savedLocations = get(settings).data.locations

    const index = savedLocations.findIndex(
      (l) => l.latitude === item.coordinates?.latitude && l.longitude === item.coordinates?.longitude,
    )
    if (index === -1) return

    savedLocations.splice(index, 1)
    settings.writeSetting(['data', 'locations'], savedLocations)
  }

  function saveLocation(item: Item) {
    if (item.id === ITEM_ID_GEOLOCATION) {
      item.coordinates = get(geolocationStore).position?.coords
    }

    if (!item.coordinates) return
    // TODO: this is made to be forgotten when changing this setting
    const savedLocations = get(settings).data.locations

    const newLocation: (typeof savedLocations)[number] = {
      id: createUUID(),
      name: item.label,
      latitude: item.coordinates.latitude,
      longitude: item.coordinates.longitude,
      // TODO: icon: item.icon
      icon: 'map-pin',
      altitude: null,
    }
    if (item.coordinates.altitude) newLocation.altitude = item.coordinates.altitude
    savedLocations.push(newLocation)

    settings.writeSetting(['data', 'locations'], savedLocations)
  }
</script>

<h5 class="text-text-muted -mb-3 text-sm">{title}</h5>
<div class={['bg-midground flex flex-col gap-0 rounded-md', disabled ? 'bg-disabled!' : '']}>
  {#if loading}
    <span class="text-muted-foreground flex flex-row items-center gap-2 px-2 py-1">
      <LoaderPulsatingRing className="size-5" />
      {placeholderLoading}
    </span>
  {:else if items === null}
    <span class="text-muted-foreground px-2 py-1">{placeholderNull}</span>
  {:else if items.length === 0}
    <span class="text-text px-2 py-1">{placeholderEmpty}</span>
  {/if}

  {#each items ?? [] as item, index}
    {@const asSaved = getSavedLocationFor(item)}

    {#if index !== 0}
      <span class=" bg-background mx-auto h-0.5 w-full"></span>
    {/if}

    <Button
      variant="ghost"
      class="flex h-fit! flex-row items-center justify-between gap-2 p-2 text-base"
      onclick={() => {
        if (selectById) {
          onselect({ id: item.id })
          return
        }

        if (!item.coordinates) return
        onselect({ coordinates: item.coordinates })
      }}
      {disabled}
    >
      <div class="flex min-w-0 flex-col">
        <div class="flex min-w-0 flex-row items-center gap-2">
          {#if item.icon}
            <item.icon class="shrink-0" />
          {:else}
            <MapPinIcon class="text-text-muted shrink-0" />
          {/if}
          <span class="overflow-hidden text-ellipsis">{item.label}</span>
        </div>
        <span class="text-text-disabled min-w-0 overflow-hidden text-left text-xs text-wrap text-ellipsis">
          {item.sublabel}
        </span>
      </div>
      <div class="flex flex-row items-center gap-2">
        {#if $geolocationStore.position?.coords && item?.coordinates}
          <span class="text-text-muted">
            {formatDistance(
              distanceMeters($geolocationStore.position.coords, {
                latitude: item.coordinates.latitude,
                longitude: item.coordinates.longitude,
                altitude: null,
              }),
            )}
          </span>
        {/if}
        {#if !disabled}
          {#if asSaved}
            <Button
              size="icon"
              variant="outline"
              class="size-8"
              onclick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (selectById) deleteSavedLocation(item)
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
              }}
            >
              <BookmarkIcon />
            </Button>
          {/if}
          <ChevronRight />
        {/if}
      </div>
    </Button>
  {/each}
</div>
