<script>
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { coordinates, selectedLocation, selectGeolocation } from '$lib/stores/location'
  import { NavigationIcon, SearchIcon } from '@lucide/svelte'
  import { onMount } from 'svelte'
  import PageWrapper from '$lib/components/layout/PageWrapper.svelte'
  import FooterMinimal from '$lib/components/layout/FooterMinimal.svelte'

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
      <h1 class="mt-auto text-center text-4xl font-bold">Confirm the use of geolocation?</h1>

      <Button
        class="text-base"
        onclick={() => {
          geolocationStore.refresh()
          selectGeolocation()
          goto('/')
        }}
      >
        <NavigationIcon /> Use current location
      </Button>

      <Accordion.Root type="single" class="mt-auto w-full">
        <Accordion.Item class="text-text-muted">
          <Accordion.Trigger class="-my-4">Why do I see this?</Accordion.Trigger>
          <Accordion.Content class="flex flex-col gap-2">
            <p class="text-sm text-text-muted">
              Your browser requires Progressive Web Apps like this one to ask for permission to use geolocation every
              time. To do this, interaction with the app is required, which the button above is for.
            </p>
            <p class="text-sm text-text-muted">
              Tip: Save locations you use often to quick access!<br />
              You can do this from <SearchIcon class="inline" /> search.
            </p>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      <FooterMinimal class="justify-between" />
    </section>
  </div>
</PageWrapper>
