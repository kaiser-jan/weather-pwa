<script lang="ts">
  import { geolocationStore } from '$lib/stores/geolocation'
  import { BookmarkIcon, ChevronRight, Trash2Icon, type Icon } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
  import { settings } from '$lib/stores/settings'
  import { getDistanceBetweenCoordinatesMeters, type Item } from '$lib/utils/location'
  import { locationSearch } from '$lib/stores/ui'
  import { deleteSavedLocation, saveLocation } from '$lib/utils/location'

  interface Props {
    title?: string
    loading?: boolean
    placeholderEmpty?: string
    placeholderNull?: string
    placeholderLoading?: string
    disabled?: boolean
    items: Item[] | null
  }

  let { title, items, loading, placeholderEmpty, placeholderLoading, placeholderNull, disabled }: Props = $props()

  function formatDistance(meters: number | null) {
    if (meters === null) return null
    // TODO: bugfix: respect unit setting
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
</script>

{#if title}
  <h5 class="-mb-3 text-sm text-text-muted">{title}</h5>
{/if}
<div
  class={[
    'flex min-h-10 shrink-0 flex-col justify-center gap-0 rounded-md bg-midground',
    disabled ? 'bg-disabled!' : '',
  ]}
>
  {#if loading}
    <span class="flex flex-row items-center gap-2 px-2 py-1 text-muted-foreground">
      <LoaderPulsatingRing className="size-5" />
      {placeholderLoading}
    </span>
  {:else if items === null}
    <span class="px-2 py-1 text-muted-foreground">{placeholderNull}</span>
  {:else if items.length === 0}
    <span class="px-2 py-1 text-text">{placeholderEmpty}</span>
  {/if}

  {#each items ?? [] as item, index (index)}
    {@const asSaved = getSavedLocationFor(item)}

    {#if index !== 0}
      <span class=" mx-auto h-0.5 w-full bg-background"></span>
    {/if}

    <Button
      variant="ghost"
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
        <span class="min-w-0 overflow-hidden text-left text-xs text-wrap text-ellipsis text-text-disabled">
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
          {#if asSaved}
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
  {/each}
</div>
