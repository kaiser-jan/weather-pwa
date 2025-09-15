<script lang="ts">
  import { goto, onNavigate } from '$app/navigation'
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

  // https://svelte.dev/blog/view-transitions
  onNavigate((navigation) => {
    if (!document.startViewTransition) return

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })
</script>

<main class="grow overflow-x-hidden overflow-y-auto scroll-smooth" bind:this={scrollContainer} onscroll={onScroll}>
  <SectionCurrent shrink={shrinkHeader} />

  <div class="flex flex-col gap-8 p-4" data-vaul-drawer-wrapper>
    {#each $settings.sections.order as sectionId, sectionIndex}
      {@const Component = getComponent(sectionId)}
      <div class="flex flex-col gap-4">
        <Component />
      </div>
    {/each}
  </div>
</main>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: translateX(60px);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: translateX(-60px);
    }
  }

  :root::view-transition-old(root) {
    animation:
      120ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }

  :root::view-transition-new(root) {
    animation:
      180ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }
</style>
