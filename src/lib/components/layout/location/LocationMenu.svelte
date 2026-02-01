<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Input } from '$lib/components/ui/input'
  import { cn } from '$lib/utils'
  import { ChevronLeftIcon, HistoryIcon, MapPinnedIcon, PencilIcon, PlayIcon, SearchIcon, XIcon } from '@lucide/svelte'
  import { settings } from '$lib/stores/settings'
  import { iconMap } from '$lib/utils/icons'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { classIconMap, reverseGeocoding, typeToString, type Item } from '$lib/utils/location'
  import { ITEM_ID_GEOLOCATION, ITEM_ID_TEMPORARY } from '$lib/types/ui'
  import { selectedLocation } from '$lib/stores/location'
  import { page } from '$app/state'
  import { locationSearch, openSettingsAt } from '$lib/stores/ui'
  import { popUntil } from '$lib/utils'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import ApiSearchResult from '$lib/components/ApiSearchResult.svelte'
  import { persisted } from 'svelte-persisted-store'
  import LocationItem from './LocationItem.svelte'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'

  const geolocationDetails = geolocationStore.details

  const SEARCH_CACHE_KEY = 'cache-location-search-results'

  interface Props {
    active: boolean
  }

  type LocationResults = { query: string; results: PlaceOutput[] }[]

  let { active }: Props = $props()

  let currentQuery = $state<string | null>(page.state.locationQuery)
  let searchNow = $state<() => void>(() => {})

  const savedLocations = settings.select((s) => s.data.locations)

  const cachedResults = persisted<LocationResults>($state.snapshot(SEARCH_CACHE_KEY), [])

  async function nominatimQuery(query: string) {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('limit', '10')
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    // url.searchParams.append('layer', ['address', 'poi', 'manmade'].join(','))
    // url.searchParams.append('featureType', ['city', 'settlement'].join(','))
    // countrycodes https://nominatim.org/release-docs/develop/api/Search/#result-restriction
    const response = await fetch(url.toString())
    const results = await response.json()
    return results as PlaceOutput[]
  }

  function clearSearch() {
    popUntil((s) => {
      return s.locationQuery === null || s.locationQuery === undefined || !s.showLocationSearch
    })
  }

  $effect(() => {
    currentQuery = page.state.locationQuery
  })

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

<Drawer.Root
  bind:open={() => page.state.showLocationSearch ?? false, (o) => (o ? locationSearch.show() : locationSearch.hide())}
>
  <!-- bind:open={isOpen} -->
  <Drawer.Trigger
    class={cn(
      buttonVariants({ variant: active ? 'default' : 'midground', size: 'icon' }),
      'size-10! grow-0 rounded-full text-xl',
    )}
  >
    <SearchIcon />
  </Drawer.Trigger>
  <Drawer.Content class="h-full">
    <div
      class="flex h-0 grow flex-col gap-4 p-4"
      style="padding-bottom: calc(1rem + min(2rem, env(safe-area-inset-top)))"
    >
      <div class="flex h-0 grow flex-col gap-4 overflow-y-auto">
        {#if page.state.locationQuery || currentQuery}
          <button class="text-bold flex w-fit flex-row items-center gap-4" onclick={() => history.back()}>
            <ChevronLeftIcon />
            <span class="inline-flex flex-wrap">
              <span>Search results for&nbsp;</span>
              <span>"{page.state.locationQuery?.trim() ?? currentQuery}"</span>
            </span>
          </button>

          <div class="flex grow flex-col gap-4 overflow-y-auto">
            <!-- TODO: onresults -->
            <!-- onresults={() => cachedResults.refresh()} -->
            <ApiSearchResult
              bind:liveQuery={currentQuery}
              bind:searchNow
              cacheKey={SEARCH_CACHE_KEY}
              load={nominatimQuery}
            >
              {#snippet children({ isLoading, result })}
                {#if isLoading}
                  <span class="flex flex-row items-center gap-2 px-2 py-1 text-muted-foreground">
                    <LoaderPulsatingRing className="size-5" />
                    Looking up "{page.state.locationQuery}"...
                  </span>
                {:else}
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
                  {:else}
                    <span class="px-2 py-1 text-text">
                      No results for "{page.state.locationQuery}".<br />
                      Try rephrasing your search!
                    </span>
                  {/each}
                {/if}
              {/snippet}
            </ApiSearchResult>
          </div>
        {:else}
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

          <!-- TODO: only show recent results when search is highlighted? and already show the search view then?-->
          <div class="mt-auto flex flex-col gap-4">
            {#if !page.state.locationQuery && !currentQuery && $cachedResults?.length}
              <h5 class="-mb-3 inline-flex items-center gap-2 text-sm text-text-muted">
                <HistoryIcon />
                Recent Searches
              </h5>
              <div class="flex flex-col gap-2">
                {#each $cachedResults ? $cachedResults.slice(0, 3).reverse() : [] as recentSearch}
                  <Button
                    variant="midground"
                    class="inline-flex items-center justify-start gap-2 px-2"
                    onclick={async () => {
                      currentQuery = recentSearch.query
                      searchNow()
                    }}
                  >
                    <SearchIcon />
                    {recentSearch.query}
                  </Button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="relative">
        <Input
          placeholder="Search any location..."
          bind:value={currentQuery}
          onkeypress={(e) => {
            if (e.key === 'Enter') searchNow()
          }}
          class="h-12"
        />
        <SearchIcon class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
        {#if currentQuery}
          <Button
            size="icon"
            variant="outline"
            class="absolute top-1/2 right-2 size-8 -translate-y-1/2 text-muted-foreground"
            onclick={clearSearch}
          >
            <XIcon />
          </Button>
        {/if}
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>
