<script>
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { coordinates, selectedLocation } from '$lib/stores/location'
  import { locationSearch } from '$lib/stores/ui'
  import { NavigationIcon, SearchIcon } from '@lucide/svelte'
  import { onMount } from 'svelte'

  onMount(() => {
    const unsubscribe = coordinates.subscribe((c) => {
      if (c !== null) goto('/')
    })
    return unsubscribe
  })
</script>

<main class="grow overflow-x-hidden overflow-y-auto scroll-smooth p-4 pb-0">
  <div class="shrink-0" style="height: env(safe-area-inset-top)"></div>
  <section
    class="bg-midground flex h-full w-full max-w-prose flex-col items-center justify-center gap-4 rounded-xl p-4"
  >
    <h1 class="text-4xl font-bold">Welcome!</h1>
    <p class="text-center text-lg">Where do you want to check the weather at?</p>
    <Button
      class="text-base"
      onclick={() => {
        geolocationStore.refresh()
        selectedLocation.set({ type: 'geolocation' })
      }}
    >
      <NavigationIcon /> Use current location
    </Button>
    or
    <Button class="text-base" onclick={locationSearch.show}>
      <SearchIcon /> Search a location
    </Button>
  </section>
</main>
