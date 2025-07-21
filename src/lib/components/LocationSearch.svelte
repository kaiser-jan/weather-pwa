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
  import { ITEM_ID_GEOLOCATION, ITEM_ID_TEMPORARY, type LocationSelection } from '$lib/types/ui'
  import { persistantState } from '$lib/utils/state.svelte'

  const geolocationDetails = geolocationStore.details

  interface Props {
    active: boolean
    onselect: (s: LocationSelection) => void
  }

  let { active, onselect: _onselect = $bindable() }: Props = $props()

  function onselect(s: LocationSelection) {
    isOpen = false
    _onselect(s)
  }

  let isOpen = $state(false)
  let isLoading = $state(false)

  $effect(() => {
    if (isOpen) geolocationStore.start()
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

  let search = persistantState('location-search-term', '')
  let results = persistantState<PlaceOutput[] | null>('location-search-results', null)

  const debouncedLoadResults = debounce(loadResults, 2000)

  async function loadResults() {
    const query = $state.snapshot(search.value)
    if (query === '') return
    console.log(`Searching for "${query}"...`)
    isLoading = true

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('limit', '10')
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    // url.searchParams.append('layer', ['address', 'poi', 'manmade'].join(','))
    // url.searchParams.append('featureType', ['city', 'settlement'].join(','))
    // countrycodes https://nominatim.org/release-docs/develop/api/Search/#result-restriction
    const response = await fetch(url.toString())
    const json = await response.json()
    console.debug(json)

    results.value = json
    isLoading = false
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
    const items = label.split('_')
    const itemsUppercase = items.map((i) => i.charAt(0).toUpperCase() + i.slice(1))
    return itemsUppercase.join(' ')
  }
</script>

<Drawer.Root bind:open={isOpen}>
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
    <div class="flex min-h-0 grow flex-col gap-4 p-4">
      <h1 class="text-bold flex flex-row items-center gap-2 text-xl">
        <MapPinnedIcon />
        Location Search
      </h1>
      <div class="flex grow flex-col gap-4 overflow-y-auto">
        <LocationList
          title="Geolocation"
          placeholderEmpty="Here should be your geolocation... :("
          loading={$geolocationStore.status === 'loading'}
          items={[
            {
              id: ITEM_ID_GEOLOCATION,
              icon: $geolocationDetails.icon,
              label: $geolocationDetails.label ?? '',
              sublabel: $geolocationAddress ?? '',
              coordinates: undefined,
            },
          ]}
          selectById
          {onselect}
          disabled={$geolocationStore.status !== 'active'}
        />

        <LocationList
          title="Saved Locations"
          placeholderEmpty="Save a searched location or your current geolocation for it to show up here."
          items={$savedLocations.map((l) => ({
            id: l.id,
            icon: iconMap[l.icon],
            label: l.name,
            sublabel: undefined,
            coordinates: l,
          }))}
          selectById
          {onselect}
        />

        <LocationList
          title="Search Results"
          placeholderEmpty={`No results for "${search.value}".\nTry rephrasing your search!`}
          placeholderNull="Use the searchbar to show the weather at another location!"
          placeholderLoading={`Looking up "${search.value}"...`}
          loading={isLoading}
          items={results.value?.map((r) => ({
            id: ITEM_ID_TEMPORARY,
            icon: classIconMap[r.category ?? r.class ?? ''],
            label: r.name !== '' ? r.name : typeToString(r.type),
            sublabel: r.display_name,
            coordinates: {
              latitude: parseFloat(r?.lat),
              longitude: parseFloat(r?.lon),
              altitude: null,
            },
          })) ?? null}
          {onselect}
        />
      </div>

      <div class="relative">
        <Input
          placeholder="Search any location..."
          bind:value={search.value}
          oninput={debouncedLoadResults}
          class="h-12"
        />
        <SearchIcon class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2" />
        {#if search}
          <Button
            size="icon"
            variant="outline"
            class="text-muted-foreground absolute top-1/2 right-2 size-8 -translate-y-1/2"
            onclick={() => {
              search.value = ''
              results.value = []
            }}
          >
            <XIcon />
          </Button>
        {/if}
      </div>
    </div>

    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  </Drawer.Content>
</Drawer.Root>
