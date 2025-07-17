<script lang="ts">
  import SectionChartDaily from '$lib/components/sections/SectionChartDaily.svelte'
  import SectionDailyDetails from '$lib/components/sections/SectionDailyDetails.svelte'
  import SectionDailyOutlook from '$lib/components/sections/SectionDailyOutlook.svelte'
  import NoticePrecipitation from '$lib/components/weather/notices/NoticePrecipitation.svelte'
  import SectionCurrent from '$lib/components/sections/SectionCurrent.svelte'
  import { settings } from '$lib/settings/store'

  let scrollContainer = $state<HTMLElement>()
  let shrinkHeader = $state(false)
  const settingCurrentSticky = settings.select((s) => s.sections.current.sticky)
  let scroll = $state(0)

  function onScroll() {
    if (!scrollContainer) return
    scroll = scrollContainer.scrollTop ?? 0
    shrinkHeader = $settingCurrentSticky && scroll > scrollContainer.clientHeight * 0.1
  }
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->

<main class="grow overflow-x-hidden overflow-y-auto scroll-smooth" bind:this={scrollContainer} onscroll={onScroll}>
  <SectionCurrent shrink={shrinkHeader} />

  <div class="flex flex-col gap-4 p-4" data-vaul-drawer-wrapper>
    <NoticePrecipitation />

    <SectionChartDaily />

    <SectionDailyDetails />

    <SectionDailyOutlook />
  </div>
</main>
