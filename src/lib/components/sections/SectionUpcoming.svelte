<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import TimelineBar from '../TimelineBar.svelte'
  import type { Coordinates } from '$lib/types/data'
  import { Skeleton } from '../ui/skeleton'
  import { interpolateColor } from '$lib/utils/ui'
  import type { DateTime } from 'luxon'
  import { autoFormatMetric } from '$lib/utils/units'
  import { NOW } from '$lib/stores/now'
  import { coordinates } from '$lib/stores/location'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import { selectedDay } from '$lib/stores/selectedDay'

  interface Props {}

  let {}: Props = $props()
</script>

<div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
  {#each $forecastStore?.daily.slice(0, 3) ?? [] as day}
    <button class="inline-flex flex-row items-center justify-between gap-3" onclick={() => selectedDay.set(day)}>
      <span class="w-[3ch]">{day.datetime.toFormat('ccc')}</span>

      <div class="flex grow gap-2">
        <TimelineBar
          multiseries={day.multiseries}
          startDatetime={day.datetime.startOf('day')}
          endDatetime={day.datetime.endOf('day')}
          parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
          marks={$settings.sections.components.timelineBar.marks.map((m) => day.datetime.set(m))}
          coordinates={$coordinates}
          datetime={$NOW}
          className="h-2"
        />
      </div>

      {#if $settings.sections.upcoming.temperature === 'range-bar'}
        <div class="flex items-center gap-2">
          <span class="text-text-muted">{autoFormatMetric(day.summary.temperature.min, 'temperature', $settings)}</span>
          <NumberRangeBar
            total={$forecastStore?.total?.summary.temperature}
            instance={day.summary.temperature}
            color="temperature"
            className="h-2 w-8"
          />
          <span class="text-text-muted">{autoFormatMetric(day.summary.temperature.max, 'temperature', $settings)}</span>
        </div>
      {:else if $settings.sections.upcoming.temperature === 'dots'}
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
    </button>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</div>
