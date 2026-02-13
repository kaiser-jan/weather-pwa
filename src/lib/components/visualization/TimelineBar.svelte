<script lang="ts">
  import type { MultivariateTimeSeries, ForecastParameter } from '$lib/types/data'
  import { cn, getStartOfDayTimestamp } from '$lib/utils'
  import TimelineBarLayer from './TimelineBarLayer.svelte'
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte'
  import { timeDay, timeHour } from 'd3'
  import { NOW_MILLIS } from '$lib/stores/now'

  type Parameter =
    | Extract<
        ForecastParameter,
        | 'temperature'
        | 'cloud_coverage'
        | 'precipitation_amount'
        | 'rain_amount'
        | 'snow_amount'
        | 'wind_speed'
        | 'uvi_clear_sky'
      >
    | 'sun'
    | 'moon'

  interface Props {
    multiseries: MultivariateTimeSeries | null
    // TODO: make this dependent on whats displayed e.g. in today? or configurable?
    parameters: Parameter[]
    startTimestamp: number
    endTimestamp: number
    className?: string
  }

  let { multiseries, parameters, startTimestamp, endTimestamp, className }: Props = $props()

  let barHeight = $state<number>(0)

  // TODO: refactor: move to metrics config
  const parameterStyleMap: Record<Parameter, 'gradient' | 'blocks'> = {
    cloud_coverage: 'gradient',
    precipitation_amount: 'blocks',
    rain_amount: 'blocks',
    snow_amount: 'blocks',
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

  const marks = $derived(
    timeHour.every(6)!.range(
      // start at 0:00 of the start timestamp
      timeDay.floor(new Date(getStartOfDayTimestamp(startTimestamp))),
      // end at the endTimestamp
      timeDay.ceil(new Date(endTimestamp)),
    ),
  )

  function limitStartTimestamp(parameter: (typeof parameters)[number]) {
    // sun/moon requires cloud_coverage data, otherwise its irritating
    if ((parameter === 'sun' || parameter === 'moon') && parameters.includes('cloud_coverage')) {
      return multiseries?.cloud_coverage?.[0]?.timestamp ?? startTimestamp
    }
    return startTimestamp
  }
</script>

<div
  class={cn('relative h-2 w-full shrink-0 overflow-hidden rounded-full bg-foreground', className)}
  bind:clientHeight={barHeight}
>
  <!-- mark passed time -->
  <div
    class="stripe-pattern absolute top-0 bottom-0 z-2 border-r-[1px] border-foreground"
    style={`width: ${distanceFromTimestamps($NOW_MILLIS, startTimestamp)}%; left: 0;`}
  ></div>

  {#each marks as mark, i (i)}
    <div
      class="absolute -top-1 -bottom-1 z-2 w-[0.1rem] bg-foreground"
      style={`left: ${distanceFromTimestamps(mark.getTime(), startTimestamp)}%;`}
    ></div>
  {/each}

  {#each parameters as parameter (parameter)}
    {#if multiseries?.[parameter as keyof typeof multiseries]?.length || ['sun', 'moon'].includes(parameter)}
      <TimelineBarLayer
        {parameter}
        series={multiseries![parameter as keyof typeof multiseries] ?? []}
        style={parameterStyleMap[parameter]}
        startTimestamp={limitStartTimestamp(parameter)}
        {endTimestamp}
        {barHeight}
        {distanceFromTimestamps}
      />
    {/if}
  {:else}
    <Skeleton class="size-full" />
  {/each}
</div>

<style lang="postcss">
  .stripe-pattern {
    background-color: var(--color-blue-500);
    background: repeating-linear-gradient(
      45deg,
      hsla(220, 20%, 20%, 25%),
      hsla(220, 20%, 20%, 25%) 4px,
      hsla(220, 25%, 12%, 40%) 4px,
      hsla(220, 25%, 12%, 40%) 8px
    );
  }
</style>
