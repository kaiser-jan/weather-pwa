<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import { DropletsIcon } from '@lucide/svelte'
  import TimelineBar from '../TimelineBar.svelte'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import WeatherSymbol from '../weather/WeatherSymbol.svelte'
  import { deriveWeatherSituationFromPeriod } from '$lib/data/symbols'
  import type { Coordinates } from '$lib/types/data'
  import { Skeleton } from '../ui/skeleton'

  interface Props {
    coordinates: Coordinates
  }

  let { coordinates }: Props = $props()
</script>

<div class="bg-midground flex flex-col gap-2 rounded-md px-3 py-2">
  {#each $forecastStore?.daily ?? [] as day}
    <div class="inline-flex flex-row items-center justify-between gap-2">
      <span class="w-[3ch]">{day.datetime.toFormat('ccc')}</span>

      <div class="flex w-[40%] gap-2">
        {#if day.multiseries}
          <TimelineBar
            multiseries={day.multiseries}
            startDatetime={day.datetime.startOf('day')}
            endDatetime={day.datetime.endOf('day')}
            parameters={['sun', 'cloud_coverage', 'precipitation_amount']}
            marks={$settings.sections.components.timelineBar.marks.map((m) => day.datetime.set(m))}
            {coordinates}
            className="h-2"
          />
        {:else}
          <WeatherSymbol className="size-6" derived={deriveWeatherSituationFromPeriod(day)} {coordinates} />
          <!-- TODO: unify this with WeatherItemCurrent, add other values -->
          {#if day.summary.precipitation_amount?.sum && day.summary.precipitation_amount.sum >= 1}
            <span class="inline-flex items-center gap-1 text-blue-200">
              <DropletsIcon />
              {Math.round(day.summary.precipitation_amount.sum)}mm
            </span>
          {/if}
        {/if}
      </div>

      <div class="flex w-[40%] items-center gap-2">
        <span class="w-[2ch]">{Math.round(day.summary.temperature.min)}</span>
        <NumberRangeBar
          total={$forecastStore?.total?.summary.temperature}
          instance={day.summary.temperature}
          color="temperature"
          className="h-2 w-full"
        />
        <span class="w-[2ch]">{Math.round(day.summary.temperature.max)}</span>
      </div>
    </div>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</div>
