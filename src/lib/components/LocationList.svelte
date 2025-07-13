<script lang="ts">
  import { geolocationStore } from '$lib/stores/geolocation'
  import type { Coordinates } from '$lib/types/data'
  import { ChevronRight, type Icon } from '@lucide/svelte'
  import { Button } from './ui/button'
  import type { LocationSelection } from '$lib/types/ui'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'

  interface Props {
    onselect: (s: LocationSelection) => void
    selectByIndex?: boolean
    loading: boolean
    placeholderEmpty?: string
    placeholderNull?: string
    placeholderLoading?: string
    items:
      | {
          icon: typeof Icon
          label: string
          sublabel: string
          coordinates: Coordinates
        }[]
      | null
  }

  let {
    items,
    selectByIndex,
    onselect = $bindable(),
    loading,
    placeholderEmpty,
    placeholderLoading,
    placeholderNull,
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
</script>

<div class="bg-midground flex flex-col gap-0 rounded-md">
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
    {#if index !== 0}
      <span class=" bg-background mx-auto h-0.5 w-full"></span>
    {/if}

    <Button
      variant="midground"
      class="flex h-fit! flex-row items-center justify-between gap-2 p-2 text-base"
      onclick={() => onselect(selectByIndex ? { index } : { coordinates: item.coordinates })}
    >
      <div class="flex min-w-0 flex-col">
        <div class="flex min-w-0 flex-row items-center gap-2">
          {#if item.icon}
            <item.icon class="shrink-0" />
          {:else}
            <LoaderPulsatingRing />
          {/if}
          <span>{item.label}</span>
        </div>
        <span class="text-text-disabled min-w-0 overflow-hidden text-left text-xs text-wrap text-ellipsis">
          {item.sublabel}
        </span>
      </div>
      <div class="flex flex-row items-center gap-2">
        {#if $geolocationStore.position?.coords}
          <span class="text-text-muted">
            {formatDistance(
              distanceMeters($geolocationStore.position.coords, {
                latitude: item.coordinates.latitude,
                longitude: item.coordinates.longitude,
              }),
            )}
          </span>
        {/if}
        <ChevronRight />
      </div>
    </Button>
  {/each}
</div>
