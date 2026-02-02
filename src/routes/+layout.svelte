<script lang="ts">
  import ErrorBoundary from '$lib/components/layout/errors/ErrorBoundary.svelte'
  import ViewTransitionProvider from '$lib/components/layout/providers/ViewTransitionProvider.svelte'
  import PwaHead from '$lib/components/layout/providers/PwaHeadProvider.svelte'
  import NotificationsProvider from '$lib/components/layout/providers/NotificationsProvider.svelte'
  import { goto } from '$app/navigation'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { coordinates, selectedLocation } from '$lib/stores/location'
  import GeolocationSuggestion from '$lib/components/GeolocationSuggestion.svelte'

  let { children } = $props()

  const geolocationDetails = geolocationStore.details

  $effect(() => {
    if ($coordinates) return
    switch ($selectedLocation?.type) {
      case 'geolocation':
        if ($geolocationDetails.stateCategory === 'inactive') safeRedirect('/setup/geolocation')
        if ($geolocationDetails.stateCategory === 'failed') safeRedirect('/setup')
        break
      case undefined:
        safeRedirect('/setup')
        break
    }
  })

  export function safeRedirect(path: string) {
    if (location.pathname !== path) goto(path)
  }
</script>

<PwaHead />

<ErrorBoundary scope="app">
  {@render children()}

  <GeolocationSuggestion />
  <ViewTransitionProvider />
  <NotificationsProvider />
</ErrorBoundary>
