<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import { Skeleton } from '../ui/skeleton'
</script>

<div class="bg-midground flex flex-row gap-2 overflow-y-auto rounded-md px-3 py-2">
  {#each $forecastStore?.daily ?? [] as day}
    <div class="inline-flex flex-col items-center justify-between gap-1">
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

      <span class="inline-flex items-baseline text-blue-200">
        <span>{Math.round(day.summary.precipitation_amount.sum)}</span>
        <span class="text-text-disabled text-xs">mm</span>
      </span>
    </div>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</div>
