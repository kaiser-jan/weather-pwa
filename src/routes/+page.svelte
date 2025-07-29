<script lang="ts">
  import { goto } from '$app/navigation'
  import SectionCurrent from '$lib/components/sections/SectionCurrent.svelte'
  import SectionOutlook from '$lib/components/sections/SectionOutlook.svelte'
  import SectionTitle from '$lib/components/sections/SectionTitle.svelte'
  import SectionTodayChart from '$lib/components/sections/SectionTodayChart.svelte'
  import SectionUpcoming from '$lib/components/sections/SectionUpcoming.svelte'
  import ViewDay from '$lib/components/sections/ViewDay.svelte'
  import NoticePrecipitation from '$lib/components/weather/notices/NoticePrecipitation.svelte'
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import { geolocationStore } from '$lib/stores/geolocation'
  import { coordinates, selectedLocation } from '$lib/stores/location'
  import { NOW, TODAY_MILLIS } from '$lib/stores/now'
  import { dayView } from '$lib/stores/ui'
  import { BinocularsIcon, CalendarDaysIcon, ChevronRightIcon, ClockIcon } from '@lucide/svelte'

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
    <NoticePrecipitation />

    <SectionTitle
      title="Today"
      icon={ClockIcon}
      actionIcon={ChevronRightIcon}
      onclick={() => dayView.open($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS) ?? null)}
    />
    <SectionTodayChart />

    <SectionTitle title="Upcoming" icon={CalendarDaysIcon} />
    <SectionUpcoming />

    <SectionTitle title="Outlook" icon={BinocularsIcon} />
    <SectionOutlook />
  </div>

  <ViewDay />
</main>
