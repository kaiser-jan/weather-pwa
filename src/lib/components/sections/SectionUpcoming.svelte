<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import TimelineBar from '$lib/components/visualization/TimelineBar.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { interpolateColor } from '$lib/utils/ui'
  import { autoFormatMetric } from '$lib/utils/units'
  import { NOW, NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
  import { coordinates } from '$lib/stores/location'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { dayView } from '$lib/stores/ui'
  import { Button } from '../ui/button'
  import { getEndOfDayTimestamp, getStartOfDayTimestamp } from '$lib/utils'
  import { DateTime } from 'luxon'
  import { CalendarDaysIcon } from '@lucide/svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'

  const SHOW_PAST = false

  let days = $derived.by(() => {
    const todayIndex = $forecastStore?.daily.findIndex((d) => d.timestamp === $TODAY_MILLIS)
    const start = SHOW_PAST ? 0 : todayIndex
    const end = (todayIndex ?? 0) + 3
    return $forecastStore?.daily.slice(start, end) ?? []
  })
</script>

<SectionTitle title="Upcoming" icon={CalendarDaysIcon} />
<FailSafeContainer name="Section Upcoming" class="flex flex-col overflow-hidden rounded-md">
  {#each days as day (day.timestamp)}
    <Button
      variant="midground"
      size="fit"
      class={[
        'border-foreground inline-flex flex-row items-center justify-between gap-4 rounded-none px-3 py-2 text-base not-last:border-b-2',
        day.timestamp < $TODAY_MILLIS ? 'opacity-40' : '',
      ]}
      onclick={() => dayView.open(day)}
    >
      <span class="w-[3ch]">{DateTime.fromMillis(day.timestamp).toFormat('ccc')}</span>

      <div class="flex grow">
        <TimelineBar
          multiseries={day.multiseries}
          startTimestamp={getStartOfDayTimestamp(day.timestamp)}
          endTimestamp={getEndOfDayTimestamp(day.timestamp)}
          parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
        />
      </div>

      {#if $settings.sections.upcoming.temperature === 'range-bar' && day.summary.temperature}
        <div class="flex items-center gap-1">
          <span class="text-text-muted">
            {autoFormatMetric(day.summary.temperature.min, 'temperature', $settings, { hideUnit: true })}
          </span>
          <NumberRangeBar
            total={$forecastStore?.total?.summary.temperature}
            instance={day.summary.temperature}
            color={METRIC_DETAILS.temperature!.color}
            className="h-2 w-16"
          />
          <span class="text-text-muted">{autoFormatMetric(day.summary.temperature.max, 'temperature', $settings)}</span>
        </div>
      {:else if $settings.sections.upcoming.temperature === 'dots' && day.summary.temperature}
        <div class="flex items-center gap-2">
          <span class="text-text-muted">{autoFormatMetric(day.summary.temperature.min, 'temperature', $settings)}</span>
          <span
            class={['size-2.5 rounded-full']}
            style={`background-color: ${interpolateColor($settings.appearance.colors.temperatureColorStops, day.summary.temperature.min)}`}
          ></span>
          <span
            class={['size-2.5 rounded-full']}
            style={`background-color: ${interpolateColor($settings.appearance.colors.temperatureColorStops, day.summary.temperature.max)}`}
          ></span>
          <span class="text-text-muted">{autoFormatMetric(day.summary.temperature.max, 'temperature', $settings)}</span>
        </div>
      {/if}
    </Button>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</FailSafeContainer>
