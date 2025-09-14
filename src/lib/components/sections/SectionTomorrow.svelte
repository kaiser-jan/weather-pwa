<script lang="ts">
  import type { ForecastMetric } from '$lib/config/metrics'
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import { TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { SECTIONS } from './registry'
  import DaySection from './reusable/DaySection.svelte'

  const tomorrow = $derived($forecastStore?.daily.find((d) => d.timestamp === $TOMORROW_MILLIS))

  let visibleMetrics = $state<ForecastMetric[]>($settings.sections.components.chart.plottedMetrics)
</script>

<DaySection
  timebucket={tomorrow}
  bind:metrics={visibleMetrics}
  icon={SECTIONS.tomorrow.icon}
  title={SECTIONS.tomorrow.name}
  showChart={$settings.sections.tomorrow.showChart}
  showSummary={$settings.sections.tomorrow.showSummary}
/>
