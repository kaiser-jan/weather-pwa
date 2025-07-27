<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Input } from '$lib/components/ui/input'
  import { cn } from '$lib/utils'
  import { ChevronLeftIcon, MapPinnedIcon, SearchIcon, XIcon } from '@lucide/svelte'
  import { settings } from '$lib/settings/store'
  import { iconMap } from '$lib/utils/icons'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { readable } from 'svelte/store'
  import LocationList from './LocationList.svelte'
  import { reverseGeocoding } from '$lib/data/location'
  import { ITEM_ID_GEOLOCATION } from '$lib/types/ui'
  import { selectedLocation } from '$lib/stores/location'
  import { page } from '$app/state'
  import { locationSearch } from '$lib/stores/ui'
  import { popUntil } from '$lib/utils'
  import LocationSearchResults from './LocationSearchResults.svelte'

  const geolocationDetails = geolocationStore.details

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
            <LocationSearchResults bind:liveQuery={currentQuery} bind:searchNow />
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
              items={[geolocationItem]}
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
  </Drawer.Content>
</Drawer.Root>
