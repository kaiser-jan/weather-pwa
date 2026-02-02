<script>
  import { goto } from '$app/navigation'
  import FooterMinimal from '$lib/components/layout/FooterMinimal.svelte'
  import PageWrapper from '$lib/components/layout/PageWrapper.svelte'
  import { Button } from '$lib/components/ui/button'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { coordinates, selectGeolocation } from '$lib/stores/location'
  import { locationSearch } from '$lib/stores/ui'
  import { NavigationIcon, SearchIcon } from '@lucide/svelte'
  import { onMount } from 'svelte'

  const geolocationDetails = geolocationStore.details

  onMount(() => {
    const unsubscribe = coordinates.subscribe((c) => {
      if (c !== null) goto('/')
    })
    return unsubscribe
  })
</script>

<PageWrapper class="p-4 pb-0">
  <div class="flex size-full justify-center rounded-xl bg-midground p-4">
    <section class="flex h-full max-w-prose flex-col items-center justify-center gap-4">
      <h1 class="mt-auto text-4xl font-bold">Welcome!</h1>
      <p class="text-center text-lg">Where do you want to check the weather at?</p>
      <Button
        class="text-base"
        disabled={$geolocationDetails.stateCategory === 'failed'}
        onclick={() => {
          geolocationStore.refresh()
          selectGeolocation()
          goto('/')
        }}
      >
        <NavigationIcon /> Use current location
      </Button>
      or
      <Button class="text-base" onclick={locationSearch.show}>
        <SearchIcon /> Search a location
      </Button>

      <FooterMinimal class="mt-auto" />
    </section>
  </div>
</PageWrapper>
