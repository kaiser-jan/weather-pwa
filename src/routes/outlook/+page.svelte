<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
  import { settings } from '$lib/settings/store'
  import WeatherChart from '$lib/components/visualization/chart/WeatherChart.svelte'
  import ParameterSelect from '$lib/components/visualization/chart/ParameterSelect.svelte'
  import type { ForecastMetric } from '$lib/config/metrics'

  let visibleMetrics = $state<ForecastMetric[]>($settings.sections.components.chart.plottedMetrics)
</script>

<main class="flex grow flex-col justify-start overflow-x-hidden overflow-y-auto scroll-smooth p-4">
  <div class="shrink-0" style="height: env(safe-area-inset-top)"></div>

  <div class="bg-midground flex flex-col gap-2 rounded-md p-2">
    <ParameterSelect bind:visible={visibleMetrics} multiseries={$forecastStore!.multiseries} />
    <WeatherChart
      multiseries={$forecastStore!.multiseries}
      parameters={visibleMetrics}
      startTimestamp={$TODAY_MILLIS}
      endTimestamp={$TODAY_MILLIS + 1000 * 3600 * 24 * 7}
      timestamp={$NOW_MILLIS}
      className="snap-center shrink-0 w-full h-[max(20vh,12rem)]"
      hideYAxes={$settings.sections.components.chart.showYAxes !== 'always'}
    />
  </div>
</main>
