<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import { Skeleton } from '../ui/skeleton'
</script>

<div class="bg-midground flex flex-row overflow-y-auto rounded-md py-1.5">
  {#each $forecastStore?.daily ?? [] as day}
    <div class="flex w-[calc(100%/7)] shrink-0 flex-col items-center justify-between gap-1">
      <span>{day.datetime.toFormat('ccc')}</span>

      <span class="text-text-muted">{Math.round(day.summary.temperature.max)}</span>
      <NumberRangeBar
        total={$forecastStore?.total?.summary.temperature}
        instance={day.summary.temperature}
        color="temperature"
        className="w-2 h-20"
        vertical
      />
      <span class="text-text-muted">{Math.round(day.summary.temperature.min)}</span>

      <!-- TODO: small bar to display intensity: for each category, color it and set the size to the percentage of time where preciptiation is in that range -->
      {#if $settings.sections.outlook.showPrecipitation}
        <span class="inline-flex items-baseline text-blue-200">
          <span>{Math.round(day.summary.precipitation_amount.sum)}</span>
          <span class="text-text-disabled text-xs">mm</span>
        </span>
      {/if}
    </div>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</div>
