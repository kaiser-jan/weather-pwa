<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Input } from '$lib/components/ui/input'
  import { cn, debounce } from '$lib/utils'
  import {
    AlertCircleIcon,
    BinocularsIcon,
    BuildingIcon,
    CarIcon,
    ChevronLeftIcon,
    DumbbellIcon,
    HammerIcon,
    type Icon as IconType,
    LandmarkIcon,
    LayersIcon,
    LeafIcon,
    MapPinIcon,
    MapPinnedIcon,
    MountainIcon,
    PlaneIcon,
    SearchIcon,
    StoreIcon,
    TrainIcon,
    WavesIcon,
    XIcon,
  } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import { iconMap } from '$lib/utils/icons'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { readable } from 'svelte/store'
  import LocationList from './LocationList.svelte'
  import { reverseGeocoding } from '$lib/data/location'
  import { ITEM_ID_GEOLOCATION, ITEM_ID_TEMPORARY } from '$lib/types/ui'
  import { persistantState } from '$lib/utils/state.svelte'
  import { selectedLocation } from '$lib/stores/location'
  import { page } from '$app/state'
  import { locationSearch } from '$lib/stores/ui'
  import { pushState, replaceState } from '$app/navigation'
  import { onMount } from 'svelte'
  import { popUntil } from '$lib/utils'

  const geolocationDetails = geolocationStore.details

  interface Props {
    active: boolean
  }

  let { active }: Props = $props()

  let isLoading = $state(false)

  $effect(() => {
    if (page.state.showLocationSearch) geolocationStore.start()
  })

  const savedLocations = settings.select((s) => s.data.locations)

  // https://gist.githubusercontent.com/seeebiii/d929a2ee2601791554d315f212164ed6/raw/poi_nominatim.json
  export const classIconMap: Record<string, typeof IconType> = {
    boundary: MapPinIcon,
    historic: LandmarkIcon,
    shop: StoreIcon,
    natural: LeafIcon,
    man_made: HammerIcon,
    amenity: BuildingIcon,
    waterway: WavesIcon,
    mountain_pass: MountainIcon,
    emergency: AlertCircleIcon,
    tourism: BinocularsIcon,
    building: BuildingIcon,
    landuse: LayersIcon,
    place: MapPinIcon,
    railway: TrainIcon,
    highway: CarIcon,
    leisure: DumbbellIcon,
    aeroway: PlaneIcon,
  }

  let currentQuery = $state<string | null>(page.state.locationQuery)
  let currentResults = $state<PlaceOutput[] | null>(null)
  const cachedResults = persistantState<{ query: string; results: PlaceOutput[] }[]>(
    'cache-location-search-results',
    [],
  )

  const debouncedLoadResults = debounce(loadNewResults, 1000)

  onMount(() => {
    const handler = async () => {
      currentQuery = page.state.locationQuery
      currentResults = await loadResults()
    }
    window.addEventListener('popstate', handler)

    return () => window.removeEventListener('popstate', handler)
  })

  function saveToHistory() {
    // consider saving each search as an history entry
    if (page.state.locationQuery) {
      replaceState('', { ...page.state, locationQuery: $state.snapshot(currentQuery) })
    } else {
      pushState('', { ...page.state, locationQuery: $state.snapshot(currentQuery) })
    }
  }

  async function loadNewResults() {
    if (!currentQuery || currentQuery === null) return

    isLoading = true
    saveToHistory()
    currentResults = await loadResults()
    isLoading = false
  }

  async function tryLoadCachedResults(newQuery: string) {
    const cached = cachedResults.value.find((c) => c.query === newQuery)
    if (!cached) return
    currentResults = cached.results
    currentQuery = newQuery
    saveToHistory()
  }

  async function loadResults() {
    // create a copy to keep during async calls
    const query = $state.snapshot(page.state.locationQuery)
    if (!query || query === '') return null

    const cache = cachedResults.value.find((c) => c.query === query)
    if (cache) {
      return cache.results
    }

    console.log(`Searching for "${query}"...`)
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('limit', '10')
    url.searchParams.append('q', query!)
    url.searchParams.append('format', 'json')
    // url.searchParams.append('layer', ['address', 'poi', 'manmade'].join(','))
    // url.searchParams.append('featureType', ['city', 'settlement'].join(','))
    // countrycodes https://nominatim.org/release-docs/develop/api/Search/#result-restriction
    const response = await fetch(url.toString())
    const newResults = await response.json()
    console.debug(newResults)

    if (!newResults) return null
    const MAX_ENTRIES = 10
    cachedResults.value.unshift({ query: query!, results: newResults })
    if (cachedResults.value.length > MAX_ENTRIES) cachedResults.value.length = MAX_ENTRIES

    return newResults
  }

  const geolocationAddress = readable<string | null>(null, (set) => {
    const unsubscribe = geolocationStore.subscribe(async (g) => {
      if (!g.position?.coords) return set(null)

      set('Looking up address...')

      try {
        const result = await reverseGeocoding(g.position.coords)
        set(result.display_name)
      } catch {
        set('Failed to fetch address.')
      }
    })

    return unsubscribe
  })

  function typeToString(label: string) {
    // https://wiki.openstreetmap.org/wiki/Key:building
    if (label === 'yes') return 'Building'
    const items = label.split('_')
    const itemsUppercase = items.map((i) => i.charAt(0).toUpperCase() + i.slice(1))
    return itemsUppercase.join(' ')
  }

  const geolocationItem = $derived({
    id: ITEM_ID_GEOLOCATION,
    icon: $geolocationDetails.icon,
    label: $geolocationDetails.label ?? '',
    sublabel: $geolocationAddress ?? '',
    coordinates: undefined,
    select: () => {
      selectedLocation.set({ type: 'geolocation' })
      locationSearch.hide()
    },
  })

  function clearSearch() {
    popUntil((s) => {
      return s.locationQuery === null || s.locationQuery === undefined || !s.showLocationSearch
    })
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
      {#if page.state.locationQuery || currentQuery}
        <div class="flex min-h-0 shrink grow flex-col gap-4">
          <button class="text-bold flex w-fit flex-row items-center gap-4" onclick={() => history.back()}>
            <ChevronLeftIcon />
            <span class="inline-flex flex-wrap">
              <span>Search results for&nbsp;</span>
              <span>"{page.state.locationQuery?.trim() ?? currentQuery}"</span>
            </span>
          </button>
          <div class="flex grow flex-col gap-4 overflow-y-auto">
            <LocationList
              placeholderEmpty={`No results for "${page.state.locationQuery}".\nTry rephrasing your search!`}
              placeholderNull="Search will start when you finish typing."
              placeholderLoading={`Looking up "${page.state.locationQuery}"...`}
              loading={isLoading}
              items={currentResults?.map((r) => ({
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
          </div>
        </div>
      {:else}
        <div class="flex min-h-0 grow flex-col gap-4">
          <h1 class="text-bold flex flex-row items-center gap-2 text-xl">
            <MapPinnedIcon class="shrink-0" />
            Your Locations
          </h1>
          <div class="flex grow flex-col gap-4 overflow-y-auto">
            <LocationList
              title="Geolocation"
              placeholderLoading="Loading your geolocation..."
              placeholderEmpty="Here should be your geolocation... :("
              loading={$geolocationStore.status === 'loading'}
              items={$geolocationStore.status === 'loading' ? [] : [geolocationItem]}
            />

            <LocationList
              title="Saved Locations"
              placeholderEmpty="Save a searched location or your current geolocation for it to show up here."
              items={$savedLocations.map((location) => ({
                id: location.id,
                icon: iconMap[location.icon],
                label: location.name,
                sublabel: undefined,
                coordinates: location,
                select: () => {
                  selectedLocation.set({ type: 'saved', location })
                  locationSearch.hide()
                },
              }))}
            />
          </div>
        </div>
      {/if}

      <div class="relative mt-auto">
        <Input
          placeholder="Search any location..."
          bind:value={currentQuery}
          oninput={(e) => {
            debouncedLoadResults()
            tryLoadCachedResults((e.target as HTMLInputElement).value)
          }}
          onkeypress={(e) => {
            if (e.key === 'Enter') loadNewResults()
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
  </Drawer.Content>
</Drawer.Root>
