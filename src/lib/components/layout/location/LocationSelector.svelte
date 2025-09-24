<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index'
  import { settings } from '$lib/stores/settings'
  import { geolocationStore } from '$lib/stores/geolocation'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
  import LocationSearch from './LocationSearch.svelte'
  import { iconMap } from '$lib/utils/icons'
  import { MapPinIcon, SearchIcon } from '@lucide/svelte'
  import { locationSearch, openSettingsAt } from '$lib/stores/ui'
  import { selectedLocation } from '$lib/stores/location'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import { onMount } from 'svelte'
  import { debounce } from '$lib/utils/common'
  import { get } from 'svelte/store'
  import type { Coordinates } from '$lib/types/data'
  import { ITEM_ID_GEOLOCATION, type Location } from '$lib/types/ui'
  import { getDistanceBetweenCoordinatesMeters, saveLocation } from '$lib/utils/location'
  import { persisted } from 'svelte-persisted-store'
  import { usePress } from 'svelte-gestures'

  const geolocationDetails = geolocationStore.details

  const settingLocations = settings.select((s) => s.data.locations)

  let suggestCurrentGeolocation = $state(false)
  const recentGeolocations = persisted<Coordinates[]>('recent-geolocations', [])

  function checkSnapGeolocationToSaved() {
    const geoposition = get(geolocationStore).position?.coords
    if (!geoposition) return []

    const locationsWithProximity: (Location & { proximityMeters: number })[] = $settingLocations.map((l) => ({
      ...l,
      proximityMeters: getDistanceBetweenCoordinatesMeters(geoposition, l)!,
    }))
    const locationsByProximity = locationsWithProximity.sort((a, b) => a.proximityMeters - b.proximityMeters)

    const closestLocation = locationsByProximity[0]
    const distance = getDistanceBetweenCoordinatesMeters(geoposition, closestLocation)!
    if (distance > $settings.data.locationSnapDistance) return []
    selectedLocation.set({ type: 'saved', location: closestLocation })
    return locationsByProximity
  }

  function checkRecentGeolocations() {
    const currentCoordinates = get(geolocationStore).position?.coords
    if (currentCoordinates === undefined) return
    recentGeolocations.update((cs) => {
      cs.unshift(currentCoordinates)
      cs.length = 20
      return cs
    })

    const recentGeolocationsWithProximity: (Coordinates & { proximityMeters: number })[] = get(recentGeolocations).map(
      (l) => ({
        ...l,
        proximityMeters: getDistanceBetweenCoordinatesMeters(currentCoordinates, l)!,
      }),
    )
    const closeEnoughGeolocations = recentGeolocationsWithProximity.filter(
      (l) => l.proximityMeters < $settings.data.locationSuggestDistance,
    )

    if (closeEnoughGeolocations.length < 3) return

    suggestCurrentGeolocation = true
  }

  function onGeolocationUse() {
    const locationsByProximity = checkSnapGeolocationToSaved()
    if (
      !locationsByProximity.length ||
      locationsByProximity[0]?.proximityMeters > $settings.data.locationSuggestDistance
    ) {
      checkRecentGeolocations()
    }
  }
  const onGeolocationUseDebounced = debounce(onGeolocationUse, 1000)

  onMount(() => {
    const geolocationStoreSnap = geolocationStore.subscribe(onGeolocationUseDebounced)

    return () => {
      geolocationStoreSnap()
    }
  })
</script>

<FailSafeContainer name="Location Selector" class="flex shrink grow flex-row items-center rounded-full bg-midground">
  <div class="flex flex-row gap-2 p-2">
    <button
      class={[
        'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
        $selectedLocation?.type === 'geolocation' ? 'bg-primary' : 'text-text-d bg-foreground',
      ]}
      onclick={() => {
        if ($selectedLocation?.type === 'geolocation') geolocationStore.refresh()
        else selectedLocation?.set({ type: 'geolocation' })
        geolocationStore.start()
        onGeolocationUseDebounced()
      }}
    >
      {#if $geolocationDetails.icon}
        {@const Icon = $geolocationDetails.icon}
        <Icon class={['-mb-0.5 -ml-0.5', $geolocationDetails.class]} />
      {:else}
        <LoaderPulsatingRing className="size-4" />
      {/if}
    </button>
  </div>
  <div class="relative w-0 grow border-x-4 border-background">
    {#if $settingLocations.length}
      <div class="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-2">
        {#each $settingLocations as location, locationIndex (location.id)}
          <button
            class={[
              'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
              $selectedLocation?.type === 'saved' && $selectedLocation.location.id === location.id
                ? 'bg-primary'
                : 'bg-foreground text-text-muted',
            ]}
            onclick={() => selectedLocation.set({ type: 'saved', location })}
            {...usePress(
              () => {},
              () => ({ timeframe: 500, triggerBeforeFinished: true }),
            )}
          >
            <!-- use:press={() => ({ timeframe: 500, triggerBeforeFinished: true })} -->
            <!-- onpress={(_) => { -->
            <!--   openSettingsAt(['data', 'locations', locationIndex.toString()]) -->
            <!-- }} -->
            {#if location.icon}
              {@const Icon = iconMap[location.icon]}
              <Icon />
            {:else}
              {location.name}
            {/if}
          </button>
        {/each}
      </div>
    {:else}
      <button
        class="inline-flex h-14 w-fit items-center p-2 px-3 text-sm text-text-muted"
        onclick={locationSearch.show}
      >
        <span class="line-clamp-2">
          Pin a location from <SearchIcon class="inline align-text-top" /> search!
        </span>
      </button>
    {/if}
    <div class="absolute top-0 right-0 h-full w-6 bg-linear-to-r from-transparent to-midground"></div>
  </div>
  <div class="flex flex-row gap-2 p-2">
    <LocationSearch active={$selectedLocation?.type === 'search'} />
  </div>
</FailSafeContainer>

<AlertDialog.Root open={suggestCurrentGeolocation}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Save this location?</AlertDialog.Title>
      <AlertDialog.Description>
        You have used your current location multiple times. Save it to shorten load-times!
        <p class="mt-1">
          You can turn this off
          <button
            class="underline"
            onclick={() => {
              openSettingsAt(['data', 'locationSuggestDistance'])
              suggestCurrentGeolocation = false
            }}
          >
            in the settings.
          </button>
        </p>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={() => (suggestCurrentGeolocation = false)}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={() => {
          suggestCurrentGeolocation = false
          saveLocation({ id: ITEM_ID_GEOLOCATION, label: 'Saved Geolocation', icon: MapPinIcon, select: () => {} })
        }}>Continue</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
