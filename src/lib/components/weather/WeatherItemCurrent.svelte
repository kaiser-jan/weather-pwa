<script lang="ts">
  import type { Forecast, WeatherMetricKey } from '$lib/types/data'
  import { CloudIcon, DropletIcon, DropletsIcon, GaugeIcon, Navigation2Icon, SunIcon, WindIcon } from 'lucide-svelte'
  import MathFraction from '$lib/components/MathFraction.svelte'

  type AvailableItemsCurrent = 'cloud_coverage' | 'uvi' | 'wind' | 'precipitation_amount' | 'pressure' | 'humidity'

  interface Props {
    item: AvailableItemsCurrent
    current: Forecast['current']
  }

  const { item, current }: Props = $props()

  const itemMap: Record<
    AvailableItemsCurrent,
    { icon: typeof CloudIcon; datapoint: WeatherMetricKey; unit?: string; multiplier?: number }
  > = {
    cloud_coverage: { icon: CloudIcon, datapoint: 'cloud_coverage', unit: '%', multiplier: 100 },
    uvi: { icon: SunIcon, datapoint: 'uvi_clear_sky' },
    wind: { icon: WindIcon, datapoint: 'wind_speed', unit: 'm/s' },
    precipitation_amount: { icon: DropletsIcon, datapoint: 'precipitation_amount', unit: 'mm' },
    pressure: { icon: GaugeIcon, datapoint: 'pressure', multiplier: 1 / 100, unit: 'hPa' },
    humidity: { icon: DropletIcon, datapoint: 'relative_humidity', unit: '%' },
  }

  const details = $derived(itemMap[item])
</script>

{#if current[details.datapoint] !== undefined}
  <span class="inline-flex items-center gap-[0.375rem]">
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <details.icon />

    <span class="inline-flex items-center gap-0.5">
      <span>{Math.round(current[details.datapoint]! * (details.multiplier ?? 1))}</span>
      {#if details.unit?.match(/\w\/\w/)}
        <MathFraction numerator={details.unit.split('/')[0]} denominator={details.unit.split('/')[1]} />
      {:else}
        {details.unit}
      {/if}
    </span>

    {#if item === 'wind' && current.wind_degrees}
      <Navigation2Icon
        class="text-text-muted size-[0.8em]!"
        style={`transform: rotate(${current.wind_degrees - 180}deg)`}
      />
    {/if}
  </span>
{/if}
