<script lang="ts">
  import SectionCurrent from '$lib/components/sections/SectionCurrent.svelte'
  import { settings } from '$lib/stores/settings'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { getComponent } from '$lib/components/sections/componentRegistry'
  import PageWrapper from '$lib/components/layout/PageWrapper.svelte'
  import { InfoIcon, ScaleIcon } from '@lucide/svelte'

  let scrollContainer = $state<HTMLElement>()
  const settingCurrentSticky = settings.select((s) => s.sections.current.sticky)
  let shrinkHeader = $state(false)
  let scroll = $state(0)

  function onScroll() {
    if (!scrollContainer) return
    scroll = scrollContainer.scrollTop ?? 0
    shrinkHeader = $settingCurrentSticky && scroll > scrollContainer.clientHeight * 0.1
  }
</script>

{#snippet tinyLink({ label, href, icon: Icon }: { label: string; href: string; icon: typeof ScaleIcon })}
  <a {href} class="inline-flex items-center justify-center gap-2 text-sm text-text-muted">
    <Icon />
    {label}
  </a>
{/snippet}

<PageWrapper bind:element={scrollContainer} onscroll={onScroll} safeArea={{ top: true, bottom: false }}>
  <SectionCurrent shrink={shrinkHeader} />

  <div class="flex flex-col gap-8 p-4 pb-0" data-vaul-drawer-wrapper>
    {#each $settings.sections.order as sectionId}
      {@const Component = getComponent(sectionId)}
      <div class="flex flex-col gap-4">
        <Component />
      </div>
    {/each}

    <div class="-my-4 h-0.5 w-full shrink-0 bg-foreground"></div>

    <div class="flex flex-row justify-center gap-4">
      {@render tinyLink({ label: 'About', href: '/?settings-path=["about"]', icon: InfoIcon })}
      {@render tinyLink({ label: 'Privacy Policy', href: '/?settings-path=["about","privacy"]', icon: ScaleIcon })}
    </div>
  </div>
</PageWrapper>
