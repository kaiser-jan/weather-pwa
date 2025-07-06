<script lang="ts">
  import type { Coordinates, MultivariateTimeSeries, WeatherMetricKey } from '$lib/types/data'
  import { cn } from '$lib/utils'
  import { DateTime } from 'luxon'
  import { onDestroy } from 'svelte'
  import TimelineBarLayer from './TimelineBarLayer.svelte'

  type Parameter =
    | Extract<
        WeatherMetricKey,
        'temperature' | 'cloud_coverage' | 'precipitation_amount' | 'wind_speed' | 'uvi_clear_sky'
      >
    | 'sun'
    | 'moon'

  interface Props {
    multiseries: MultivariateTimeSeries
    parameters: Parameter[]
    startDatetime: DateTime
    endDatetime: DateTime
    marks?: DateTime[]
    coordinates?: Coordinates
    className: string
  }

  let { multiseries, parameters, startDatetime, endDatetime, marks = [], coordinates, className }: Props = $props()

  let barHeight = $state<number>(0)

  // TODO: make this configurable in the parameter list
  // style: gradient | color | size
  // color: fluent | steps | constant
  // TODO: consider adding a threshold
  const parameterStyleMap: Record<Parameter, 'gradient' | 'blocks'> = {
    cloud_coverage: 'gradient',
    precipitation_amount: 'blocks',
    temperature: 'gradient',
    sun: 'gradient',
    moon: 'gradient',
    wind_speed: 'blocks',
    uvi_clear_sky: 'gradient',
  }

  function distanceFromDatetimes(
    d: DateTime,
    d1: DateTime = startDatetime,
    start: DateTime = startDatetime,
    end = endDatetime,
  ) {
    console.log('distanceFromDatetimes')
    if (!d || !d1 || !start || !end) return
    return ((d.toUnixInteger() - d1.toUnixInteger()) / (end.toUnixInteger() - start.toUnixInteger())) * 100
  }

  let now = $state(DateTime.now())
  const intervalUpdateCurrentDate = setInterval(() => {
    now = DateTime.now()
  }, 60000)

  onDestroy(() => clearInterval(intervalUpdateCurrentDate))
</script>

<div
  class={cn('bg-foreground relative h-full w-full overflow-hidden rounded-full', className)}
  bind:clientHeight={barHeight}
>
  <div
    class="stripe-pattern absolute top-0 bottom-0 z-10"
    style={`width: ${distanceFromDatetimes(now, startDatetime)}%; left: 0;`}
  ></div>
  {#each marks as mark}
    <div
      class="bg-foreground absolute -top-1 -bottom-1 z-10 w-[0.05rem] mix-blend-difference"
      style={`left: ${distanceFromDatetimes(mark, startDatetime)}%;`}
    ></div>
  {/each}
  {#each parameters as parameter}
    <!-- TODO: properly handle sun and moon -->
    {#if multiseries[parameter as keyof typeof multiseries]?.length || ['sun', 'moon'].includes(parameter)}
      <TimelineBarLayer
        {parameter}
        series={multiseries[parameter as keyof typeof multiseries] ?? []}
        style={parameterStyleMap[parameter]}
        {startDatetime}
        {endDatetime}
        {coordinates}
        {barHeight}
        {distanceFromDatetimes}
      />
    {/if}
  {/each}
</div>

<style lang="postcss">
  .stripe-pattern {
    background-color: var(--color-blue-500);
    background: repeating-linear-gradient(
      45deg,
      hsla(220, 20%, 20%, 45%),
      hsla(220, 20%, 20%, 45%) 4px,
      hsla(220, 25%, 12%, 70%) 4px,
      hsla(220, 25%, 12%, 70%) 8px
    );
  }
</style>
