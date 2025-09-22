<script lang="ts">
  import { settings } from '$lib/stores/settings'
  import { forecastStore } from '$lib/stores/data'
  import { TOMORROW_MILLIS } from '$lib/stores/now'
  import { SECTIONS } from './registry'
  import DaySection from './reusable/DaySection.svelte'

  const tomorrow = $derived($forecastStore?.daily.find((d) => d.timestamp === $TOMORROW_MILLIS))
</script>

<DaySection
  timebucket={tomorrow}
  bind:metrics={$settings.sections.components.chart.plottedMetrics}
  icon={SECTIONS.tomorrow.icon}
  title={SECTIONS.tomorrow.name}
  showChart={$settings.sections.tomorrow.showChart}
  showSummary={$settings.sections.tomorrow.showSummary}
/>
