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

  interface Props {}

  let {}: Props = $props()
</script>

<div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
  {#each $forecastStore?.daily.slice(0, 3) ?? [] as day}
    <div class="inline-flex flex-row items-center justify-between gap-3">
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

      <div class="flex gap-2">
        {#each ['min', 'max'] as const as limit}
          <div class={['flex items-center gap-1', limit === 'min' ? 'flex-row' : 'flex-row-reverse']}>
            {autoFormatMetric(day.summary.temperature[limit], 'temperature', $settings)}
            <span
              class={['h-4 w-[0.25rem]', limit === 'min' ? 'rounded-l-sm' : 'rounded-r-sm']}
              style={`background-color: ${interpolateColor($settings.appearance.colors.temperatureColorStops, day.summary.temperature[limit])}`}
            ></span>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</div>
