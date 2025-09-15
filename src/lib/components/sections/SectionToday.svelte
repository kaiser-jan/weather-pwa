<script lang="ts">
  import type { ForecastMetric } from '$lib/config/metrics'
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import { NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
  import { Duration } from 'luxon'
  import { SECTIONS } from './registry'
  import DaySection from './reusable/DaySection.svelte'
  import { next24Hours } from '$lib/stores/next24Hours'

  const today = $derived($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS))

  let visibleMetrics = $state<ForecastMetric[]>($settings.sections.components.chart.plottedMetrics)

  const firstDatapointTimestamp = $derived.by(() => {
    if (!today) return null
    const firstTimestamps = Object.values(today.multiseries)
      .map((m) => (m[0].value === null ? null : m[0].timestamp))
      .sort()
    return firstTimestamps[0]
  })

  const showFullDay = $derived.by(() => {
    if ($settings.sections.today.fullDay === 'always') return true
    if ($settings.sections.today.fullDay === 'never') return false
    const isFullDayAvailable = firstDatapointTimestamp && today && firstDatapointTimestamp <= today.timestamp
    return isFullDayAvailable
  })
</script>

<DaySection
  timebucket={showFullDay ? today : $next24Hours}
  bind:metrics={visibleMetrics}
  icon={SECTIONS.today.icon}
  title={SECTIONS.today.name}
  showChart={$settings.sections.today.showChart}
  showSummary={$settings.sections.today.showSummary}
/>
