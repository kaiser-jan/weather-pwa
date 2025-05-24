<script lang="ts">
  import type { Forecast, ForecastInstant } from '$lib/types/data'
  import { CloudIcon, Navigation2Icon, SunIcon, UmbrellaIcon, WindIcon } from 'lucide-svelte'
  import MathFraction from '../MathFraction.svelte'

  type AvailableItemsCurrent = 'cloud_coverage' | 'uvi' | 'wind'

  interface Props {
    item: AvailableItemsCurrent
    data: Forecast
  }

  const { item, data }: Props = $props()

  const itemMap: Record<
    AvailableItemsCurrent,
    { icon: typeof CloudIcon; datapoint: keyof ForecastInstant; unit?: string; multiplier?: number }
  > = {
    cloud_coverage: { icon: CloudIcon, datapoint: 'cloud_coverage', unit: '%', multiplier: 100 },
    uvi: { icon: SunIcon, datapoint: 'uvi_clear_sky' },
    wind: { icon: WindIcon, datapoint: 'wind_speed', unit: 'm/s' },
  }

  const details = $derived(itemMap[item])
</script>

{#if data.current[details.datapoint]}
  <span class="inline-flex items-center gap-2">
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <details.icon class="size-[1em]" />

    <span class="inline-flex items-center gap-0.5">
      <span>{Math.round(data.current[details.datapoint]! * (details.multiplier ?? 1))}</span>
      {#if details.unit?.match(/\w\/\w/)}
        <MathFraction numerator={details.unit.split('/')[0]} denominator={details.unit.split('/')[1]} />
      {:else}
        {details.unit}
      {/if}
    </span>

    {#if item === 'wind' && data.current.wind_degrees}
      <Navigation2Icon
        class="text-text-muted size-[0.8em]"
        style={`transform: rotate(${data.current.wind_degrees - 180}deg)`}
      />
    {/if}
  </span>
{/if}
