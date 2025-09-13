<script lang="ts">
  import { goto } from '$app/navigation'
  import SectionCurrent from '$lib/components/sections/SectionCurrent.svelte'
  import { settings } from '$lib/settings/store'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { coordinates, selectedLocation } from '$lib/stores/location'
  import { getComponent } from '$lib/components/sections/componentRegistry'

  let scrollContainer = $state<HTMLElement>()
  let shrinkHeader = $state(false)
  const settingCurrentSticky = settings.select((s) => s.sections.current.sticky)
  let scroll = $state(0)

  function onScroll() {
    if (!scrollContainer) return
    scroll = scrollContainer.scrollTop ?? 0
    shrinkHeader = $settingCurrentSticky && scroll > scrollContainer.clientHeight * 0.1
  }

  const geolocationDetails = geolocationStore.details

  $effect(() => {
    if ($coordinates) return
    switch ($selectedLocation?.type) {
      case 'geolocation':
        if ($geolocationDetails.stateCategory === 'inactive') goto('/setup/geolocation')
        if ($geolocationDetails.stateCategory === 'failed') goto('/setup')
        break
      case undefined:
        goto('/setup')
        break
    }
  })
</script>

<main class="grow overflow-x-hidden overflow-y-auto scroll-smooth" bind:this={scrollContainer} onscroll={onScroll}>
  <SectionCurrent shrink={shrinkHeader} />

  <div class="flex flex-col gap-4 p-4" data-vaul-drawer-wrapper>
    {#each $settings.sections.order as sectionId}
      {@const Component = getComponent(sectionId)}
      <Component />
    {/each}
  </div>
</main>
