<script lang="ts">
  import type { Coordinates, WeatherMetricKey } from '$lib/types/data'
  import { settings } from '$lib/settings/store'
  import { DateTime } from 'luxon'
  import { onDestroy, onMount } from 'svelte'
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import { forecastStore } from '$lib/stores/data'
  import SettingsButton from '$lib/components/SettingsButton.svelte'
  import SectionChartDaily from '$lib/components/sections/SectionChartDaily.svelte'
  import SectionDailyDetails from '$lib/components/sections/SectionDailyDetails.svelte'
  import SectionDailyOutlook from '$lib/components/sections/SectionDailyOutlook.svelte'
  import NoticePrecipitation from '$lib/components/weather/notices/NoticePrecipitation.svelte'
  import SectionCurrent from '$lib/components/sections/SectionCurrent.svelte'

  let isLoading = $state(false)
  let coordinates = $state<Coordinates>()
  let NOW = $state(DateTime.now())

  const settingData = settings.select((s) => s.data)

  $effect(() => {
    // auto refresh
    if (coordinates && NOW) {
      loadForecastData()
    }
  })

  async function loadForecastData() {
    console.debug(`Requesting forecast data update`)

    if (!coordinates) {
      console.warn(`Unable to load data, no coordinates.`)
      return
    }

    isLoading = true

    forecastStore.update(coordinates, $settingData.datasets, $settingData.incrementalLoad)

    // show the spinning even when using cache
    setTimeout(() => (isLoading = false), 500)
  }

  function onMinuteChange() {
    NOW = DateTime.now()
    scheduleNextMinuteChange()
  }

  function scheduleNextMinuteChange() {
    const millisecondsUntilNextMinute = 60 * 1000 - DateTime.now().second * 1000 - DateTime.now().millisecond
    setTimeout(onMinuteChange, millisecondsUntilNextMinute)
  }

  // Start the first schedule
  scheduleNextMinuteChange()

  let updateDateTimeInterval: ReturnType<typeof setInterval>
  onMount(() => {
    updateDateTimeInterval = setInterval(() => (NOW = DateTime.now()), 60 * 1000)
  })

  onDestroy(() => {
    clearInterval(updateDateTimeInterval)
  })
</script>

<!-- TODO: add data-vaul-drawer-wrapper -->
<SectionCurrent shrink={false} datetime={NOW} {coordinates} loading={isLoading} refresh={loadForecastData} />

<div class="flex flex-col gap-4 p-4">
  <NoticePrecipitation datetime={NOW} />

  <SectionChartDaily datetime={NOW} />

  <SectionDailyDetails {coordinates} datetime={NOW} />

  <SectionDailyOutlook {coordinates} datetime={NOW} />

  <!-- NOTE: bottom navbar overlap padding -->
  <div class="h-16"></div>

  <div
    class="from-background via-background/80 absolute right-0 bottom-0 left-0 flex h-30 flex-row gap-2 bg-gradient-to-t to-transparent"
  ></div>
  <div class="absolute right-6 bottom-6 left-6 z-20 flex flex-row gap-2">
    <LocationSelector bind:coordinates />
    <SettingsButton />
  </div>
</div>
