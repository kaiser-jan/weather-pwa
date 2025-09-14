<script lang="ts">
  import type { ForecastMetric } from '$lib/config/metrics'
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import { TODAY_MILLIS } from '$lib/stores/now'
  import { SECTIONS } from './registry'
  import DaySection from './reusable/DaySection.svelte'

  const today = $derived($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS))

  let visibleMetrics = $state<ForecastMetric[]>($settings.sections.components.chart.plottedMetrics)
</script>

<DaySection
  timebucket={today}
  bind:metrics={visibleMetrics}
  icon={SECTIONS.today.icon}
  title={SECTIONS.today.name}
  showChart={$settings.sections.today.showChart}
  showSummary={$settings.sections.today.showSummary}
/>
