<script lang="ts">
  import { settings } from '$lib/stores/settings'
  import { forecastStore } from '$lib/stores/data'
  import { TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { SECTIONS } from './registry'
  import DaySection from './reusable/DaySection.svelte'
  import { next24Hours } from '$lib/stores/next24Hours'
  import { useSwipe } from 'svelte-gestures'
  import { dayView } from '$lib/stores/ui'

  const today = $derived($forecastStore?.daily.find((d) => d.timestamp === $TODAY_MILLIS))
  const tomorrow = $derived($forecastStore?.daily.find((d) => d.timestamp === $TOMORROW_MILLIS))

  let container = $state<HTMLDivElement>()

  let settingSwipeTomorrow = settings.select((s) => s.sections.today.swipeTomorrow)

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

<div
  class="scrollbar-hidden flex w-full snap-x snap-mandatory flex-row gap-0 overflow-x-hidden overflow-y-hidden"
  bind:this={container}
  {...useSwipe(
    (e) => {
      if (!container) return

      if ($settingSwipeTomorrow) {
        // HACK: iOS dislikes scrolling + chart interaction (axis pointer / tooltip)
        if (e.detail.direction === 'left') container.scrollLeft = container.scrollWidth
        else if (e.detail.direction === 'right') container.scrollLeft = 0
      } else {
        if (e.detail.direction === 'left') dayView.open(tomorrow)
      }
    },
    () => ({ touchAction: 'pan-y', minSwipeDistance: 30, timeframe: 300 }),
  )}
>
  <!-- TODO: consider persisting scroll for the rest of the day -->
  <div class="flex w-full shrink-0 snap-start flex-col gap-4">
    <DaySection
      timebucket={showFullDay ? today : $next24Hours}
      bind:metrics={$settings.sections.components.chart.plottedMetrics}
      icon={SECTIONS.today.icon}
      title={SECTIONS.today.name}
      showChart={$settings.sections.today.showChart}
      showSummary={$settings.sections.today.showSummary}
    />
  </div>

  {#if $settingSwipeTomorrow}
    <div class="flex w-full shrink-0 snap-start flex-col gap-4">
      <DaySection
        timebucket={tomorrow}
        bind:metrics={$settings.sections.components.chart.plottedMetrics}
        icon={SECTIONS.tomorrow.icon}
        title={SECTIONS.tomorrow.name}
        showChart={$settings.sections.today.showChart}
        showSummary={$settings.sections.today.showSummary}
      />
    </div>
  {/if}
</div>
