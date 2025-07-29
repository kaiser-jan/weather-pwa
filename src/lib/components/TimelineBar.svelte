<script lang="ts">
  import type { Coordinates, MultivariateTimeSeries, ForecastParameter } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { DateTime } from 'luxon'
  import TimelineBarLayer from './TimelineBarLayer.svelte'
  import Skeleton from './ui/skeleton/skeleton.svelte'

  type Parameter =
    | Extract<
        ForecastParameter,
        'temperature' | 'cloud_coverage' | 'precipitation_amount' | 'wind_speed' | 'uvi_clear_sky'
      >
    | 'sun'
    | 'moon'

  interface Props {
    multiseries: MultivariateTimeSeries | null
    parameters: Parameter[]
    startTimestamp: number
    endTimestamp: number
    datetime: number
    marks?: DateTime[]
    coordinates: Coordinates | null
    className: string
  }

  let {
    multiseries,
    parameters,
    startTimestamp: startTimestamp,
    endTimestamp: endTimestamp,
    datetime: NOW,
    marks = [],
    coordinates,
    className,
  }: Props = $props()

  let barHeight = $state<number>(0)

  // TODO: consider making this configurable by the user
  const parameterStyleMap: Record<Parameter, 'gradient' | 'blocks'> = {
    cloud_coverage: 'gradient',
    precipitation_amount: 'blocks',
    temperature: 'gradient',
    sun: 'gradient',
    moon: 'gradient',
    wind_speed: 'blocks',
    uvi_clear_sky: 'gradient',
  }

  function distanceFromTimestamps(
    t: number,
    t1: number = startTimestamp,
    start: number = startTimestamp,
    end: number = endTimestamp,
  ) {
    if (!t || !t1 || !start || !end) return
    return ((t - t1) / (end - start)) * 100
  }
</script>

<div
  class={cn('bg-foreground relative h-full w-full shrink-0 overflow-hidden rounded-full', className)}
  bind:clientHeight={barHeight}
>
  <div
    class="stripe-pattern absolute top-0 bottom-0 z-2"
    style={`width: ${distanceFromTimestamps(NOW, startTimestamp)}%; left: 0;`}
  ></div>
  {#each marks as mark, i (i)}
    <div
      class="bg-foreground absolute -top-1 -bottom-1 z-2 w-[0.05rem] mix-blend-difference"
      style={`left: ${distanceFromTimestamps(mark.toMillis(), startTimestamp)}%;`}
    ></div>
  {/each}
  {#each parameters as parameter (parameter)}
    <!-- TODO: properly handle sun and moon -->
    {#if multiseries?.[parameter as keyof typeof multiseries]?.length || ['sun', 'moon'].includes(parameter)}
      <TimelineBarLayer
        {parameter}
        series={multiseries![parameter as keyof typeof multiseries] ?? []}
        style={parameterStyleMap[parameter]}
        {startTimestamp}
        {endTimestamp}
        {coordinates}
        {barHeight}
        distanceFromDatetimes={distanceFromTimestamps}
      />
    {:else}
      <Skeleton class="size-full" />
    {/if}
  {/each}
</div>

<style lang="postcss">
  .stripe-pattern {
    background-color: var(--color-blue-500);
    background: repeating-linear-gradient(
      45deg,
      hsla(220, 20%, 20%, 25%),
      hsla(220, 20%, 20%, 25%) 4px,
      hsla(220, 25%, 12%, 50%) 4px,
      hsla(220, 25%, 12%, 50%) 8px
    );
  }
</style>
