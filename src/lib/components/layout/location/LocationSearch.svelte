<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Input } from '$lib/components/ui/input'
  import { cn } from '$lib/utils'
  import { ChevronLeftIcon, HistoryIcon, MapPinnedIcon, PencilIcon, SearchIcon, XIcon } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import { iconMap } from '$lib/utils/icons'
  import { geolocationStore } from '$lib/stores/geolocation'
  import LocationList from './LocationList.svelte'
  import { classIconMap, typeToString } from '$lib/utils/location'
  import { ITEM_ID_GEOLOCATION, ITEM_ID_TEMPORARY } from '$lib/types/ui'
  import { selectedLocation } from '$lib/stores/location'
  import { page } from '$app/state'
  import { locationSearch, openSettingsAt } from '$lib/stores/ui'
  import { popUntil } from '$lib/utils'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import { pushState } from '$app/navigation'
  import ApiSearchResult from '$lib/components/ApiSearchResult.svelte'
  import { persist } from '$lib/utils/stores'

  const geolocationDetails = geolocationStore.details

  const SEARCH_CACHE_KEY = 'cache-location-search-results'

  interface Props {
    active: boolean
  }

  let { active }: Props = $props()

  $effect(() => {
    if (page.state.showLocationSearch) geolocationStore.start()
  })

  let currentQuery = $state<string | null>(page.state.locationQuery)
  let searchNow = $state<() => void>(() => {})

  const savedLocations = settings.select((s) => s.data.locations)

  const cachedResults = persist<{ query: string; results: PlaceOutput[] }[]>($state.snapshot(SEARCH_CACHE_KEY), [])

  const geolocationItem = $derived({
    id: ITEM_ID_GEOLOCATION,
    icon: $geolocationDetails.icon,
    label: $geolocationDetails.label ?? '',
    coordinates: undefined,
    select: () => {
      selectedLocation.set({ type: 'geolocation' })
      locationSearch.hide()
    },
  })

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
      {#if page.state.locationQuery || currentQuery}
        <button class="text-bold flex w-fit flex-row items-center gap-4" onclick={() => history.back()}>
          <ChevronLeftIcon />
          <span class="inline-flex flex-wrap">
            <span>Search results for&nbsp;</span>
            <span>"{page.state.locationQuery?.trim() ?? currentQuery}"</span>
          </span>
        </button>

        <div class="flex grow flex-col gap-4 overflow-y-auto">
          <ApiSearchResult
            bind:liveQuery={currentQuery}
            bind:searchNow
            cacheKey={SEARCH_CACHE_KEY}
            load={nominatimQuery}
          >
            {#snippet children({ isLoading, result })}
              <LocationList
                placeholderEmpty={`No results for "${page.state.locationQuery}".\nTry rephrasing your search!`}
                placeholderNull="Search will start when you finish typing."
                placeholderLoading={`Looking up "${page.state.locationQuery}"...`}
                loading={isLoading}
                items={result?.map((r) => ({
                  id: ITEM_ID_TEMPORARY,
                  icon: classIconMap[r.category ?? r.class ?? ''],
                  label: r.name !== '' ? r.name : typeToString(r.type),
                  sublabel: r.display_name,
                  coordinates: {
                    latitude: parseFloat(r?.lat),
                    longitude: parseFloat(r?.lon),
                    altitude: null,
                  },
                  select: () => {
                    selectedLocation.set({
                      type: 'search',
                      coordinates: {
                        latitude: parseFloat(r?.lat),
                        longitude: parseFloat(r?.lon),
                        altitude: null,
                      },
                    })
                    locationSearch.hide()
                  },
                })) ?? null}
              />
            {/snippet}
          </ApiSearchResult>
        </div>
      {:else}
        <h1 class="text-bold flex flex-row items-center gap-2 text-xl">
          <MapPinnedIcon class="shrink-0" />
          Your Locations
        </h1>
        <div class="flex grow flex-col gap-4 overflow-y-auto">
          <LocationList
            title="Geolocation"
            placeholderLoading="Loading your geolocation..."
            placeholderEmpty="Here should be your geolocation... :("
            items={[geolocationItem]}
          />

          <LocationList
            title="Saved Locations"
            placeholderEmpty="Save a searched location or your current geolocation for it to show up here."
            items={$savedLocations.map((location) => ({
              id: location.id,
              icon: iconMap[location.icon],
              label: location.name,
              coordinates: location,
              select: () => {
                selectedLocation.set({ type: 'saved', location })
                locationSearch.hide()
              },
            }))}
          />
          <Button variant="outline" onclick={() => openSettingsAt(['data', 'locations'])}>
            <PencilIcon /> Edit saved locations
          </Button>
        </div>
      {/if}

      <div class="mt-auto flex flex-col gap-4">
        {#if !page.state.locationQuery && !currentQuery}
          <h5 class="text-text-muted -mb-3 inline-flex items-center gap-2 text-sm">
            <HistoryIcon />
            Recent Searches
          </h5>
          <div class="flex flex-col gap-2">
            {#each $cachedResults ? $cachedResults.slice(0, 3) : [] as recentSearch}
              <Button
                variant="midground"
                class="inline-flex items-center justify-start gap-2 px-2"
                onclick={() => {
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

        <div class="relative">
          <Input
            placeholder="Search any location..."
            bind:value={currentQuery}
            onkeypress={(e) => {
              if (e.key === 'Enter') searchNow()
            }}
            class="h-12"
          />
          <SearchIcon class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2" />
          {#if currentQuery}
            <Button
              size="icon"
              variant="outline"
              class="text-muted-foreground absolute top-1/2 right-2 size-8 -translate-y-1/2"
              onclick={clearSearch}
            >
              <XIcon />
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>
