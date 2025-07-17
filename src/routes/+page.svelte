<script lang="ts">
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import SettingsButton from '$lib/components/SettingsButton.svelte'
  import SectionChartDaily from '$lib/components/sections/SectionChartDaily.svelte'
  import SectionDailyDetails from '$lib/components/sections/SectionDailyDetails.svelte'
  import SectionDailyOutlook from '$lib/components/sections/SectionDailyOutlook.svelte'
  import NoticePrecipitation from '$lib/components/weather/notices/NoticePrecipitation.svelte'
  import SectionCurrent from '$lib/components/sections/SectionCurrent.svelte'
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->
<SectionCurrent shrink={false} />

<div class="flex flex-col gap-4 p-4">
  <NoticePrecipitation />

  <SectionChartDaily />

  <SectionDailyDetails />

  <SectionDailyOutlook />

  <!-- NOTE: bottom navbar overlap padding -->
  <div class="h-16"></div>

  <div
    class="from-background via-background/80 absolute right-0 bottom-0 left-0 flex h-30 flex-row gap-2 bg-gradient-to-t to-transparent"
  ></div>
  <div class="absolute right-6 bottom-6 left-6 z-20 flex flex-row gap-2">
    <LocationSelector />
    <SettingsButton />
  </div>
</div>
