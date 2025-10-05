<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index'
  import { geolocationStore, type GeolocationState } from '$lib/stores/geolocation'
  import type { Coordinates } from '$lib/types/data'
  import { persisted } from 'svelte-persisted-store'
  import { get } from 'svelte/store'
  import { settings } from '$lib/stores/settings'
  import { selectedLocation } from '$lib/stores/location'
  import { ITEM_ID_GEOLOCATION, type Location } from '$lib/types/ui'
  import { getDistanceBetweenCoordinatesMeters, saveLocation } from '$lib/utils/location'
  import { onMount } from 'svelte'
  import { openSettingsAt } from '$lib/stores/ui'
  import { MapPinIcon } from '@lucide/svelte'

  let suggestCurrentGeolocation = $state(false)
  const recentGeolocations = persisted<GeolocationPosition[]>('recent-geolocations', [])

  function checkSnapGeolocationToSaved(geolocation: GeolocationState) {
    const geoposition = geolocation.position?.coords
    if (!geoposition) return []

    const locationsWithProximity: (Location & { proximityMeters: number })[] = $settings.data.locations.map((l) => ({
      ...l,
      proximityMeters: getDistanceBetweenCoordinatesMeters(geoposition, l)!,
    }))
    const locationsByProximity = locationsWithProximity.sort((a, b) => a.proximityMeters - b.proximityMeters)

    const closestLocation = locationsByProximity[0]
    if (!locationsByProximity.length) return []
    const distance = getDistanceBetweenCoordinatesMeters(geoposition, closestLocation)!
    if (distance > $settings.data.locationSnapDistance) return []
    selectedLocation.set({ type: 'saved', location: closestLocation })
    return locationsByProximity
  }

  function checkRecentGeolocations(geolocation: GeolocationState) {
    const currentPosition = geolocation.position
    if (currentPosition === null) return
    // only allow newer entries to avoid duplicates
    if (currentPosition.timestamp <= $recentGeolocations[0]?.timestamp) return

    recentGeolocations.update((cs) => {
      cs.unshift(currentPosition)
      if (cs.length > 20) cs.length = 20
      return cs
    })

    const recentGeolocationsWithProximity: (Coordinates & { proximityMeters: number })[] = get(recentGeolocations).map(
      (l) => ({
        ...l.coords,
        proximityMeters: getDistanceBetweenCoordinatesMeters(currentPosition?.coords, l.coords)!,
      }),
    )
    const closeEnoughGeolocations = recentGeolocationsWithProximity.filter(
      (l) => l.proximityMeters < $settings.data.locationSuggestDistance,
    )

    if (closeEnoughGeolocations.length < 3) return

    suggestCurrentGeolocation = true
  }

  function onGeolocationUse(geolocation: GeolocationState) {
    const locationsByProximity = checkSnapGeolocationToSaved(geolocation)
    if (
      !locationsByProximity.length ||
      locationsByProximity[0]?.proximityMeters > $settings.data.locationSuggestDistance
    ) {
      checkRecentGeolocations(geolocation)
    }
  }

  onMount(() => {
    const geolocationStoreSnap = geolocationStore.subscribe(onGeolocationUse)
    const selectedLocationSnap = selectedLocation.subscribe((l) => {
      if (l?.type === 'geolocation') onGeolocationUse(get(geolocationStore))
    })

    return () => {
      geolocationStoreSnap()
      selectedLocationSnap()
    }
  })
</script>

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
