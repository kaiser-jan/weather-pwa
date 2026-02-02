<script lang="ts">
  import { ChevronLeftIcon } from '@lucide/svelte'
  import { classIconMap, typeToString, type Item } from '$lib/utils/location'
  import { ITEM_ID_TEMPORARY } from '$lib/types/ui'
  import { selectedLocation } from '$lib/stores/location'
  import { page } from '$app/state'
  import { locationSearch } from '$lib/stores/ui'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import LocationItem from './LocationItem.svelte'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'

  interface Props {
    loading: boolean
    result: PlaceOutput[] | null
    query: string | null
    clear: () => void
  }

  let { loading, result, query, clear }: Props = $props()

  function locationItemFromSearchResult(r: PlaceOutput): Omit<Item, 'select'> {
    return {
      id: ITEM_ID_TEMPORARY,
      icon: classIconMap[r.category ?? r.class ?? ''],
      label: r.name !== '' ? r.name : typeToString(r.type),
      sublabel: r.display_name,
      coordinates: {
        latitude: parseFloat(r?.lat),
        longitude: parseFloat(r?.lon),
        altitude: null,
      },
    }
  }
</script>

<button class="text-bold flex w-fit flex-row items-center gap-4" onclick={clear}>
  <ChevronLeftIcon />
  <span class="inline-flex flex-wrap">
    <span>Search results&nbsp;</span>
    {#if query && query.length}
      <span>for "{query}"</span>
    {/if}
  </span>
</button>

<div class="flex grow flex-col gap-4 overflow-y-auto">
  {#if loading}
    <span class="flex flex-row items-center gap-2 px-2 py-1 text-muted-foreground">
      <LoaderPulsatingRing className="size-5" />
      Looking up "{page.state.locationQuery}"...
    </span>
  {:else if !result || result.length === 0}
    <span class="px-2 py-1 text-text">
      No results for "{page.state.locationQuery}".<br />
      Try rephrasing your search!
    </span>
  {:else if query && query.length}
    {#each result ?? [] as r}
      <LocationItem
        type="search"
        item={{
          ...locationItemFromSearchResult(r),
          select: () => {
            selectedLocation.set({
              type: 'search',
              ...(locationItemFromSearchResult(r) as Required<Item>),
            })
            locationSearch.hide()
          },
        }}
      />
    {/each}
  {/if}
</div>
