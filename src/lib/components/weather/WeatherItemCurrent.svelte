<script lang="ts">
  import type { Forecast, WeatherMetricKey } from '$lib/types/data'
  import { CloudIcon, DropletIcon, DropletsIcon, GaugeIcon, Navigation2Icon, SunIcon, WindIcon } from '@lucide/svelte'
  import FormattedMetric from '../FormattedMetric.svelte'

  interface Props {
    item: WeatherMetricKey
    current: Forecast['current'] | null
  }

  const { item, current }: Props = $props()

  type Details = { icon?: typeof CloudIcon; datapoint: WeatherMetricKey }

  const itemMap: Partial<Record<WeatherMetricKey, Details>> = {
    cloud_coverage: { icon: CloudIcon, datapoint: 'cloud_coverage' },
    uvi: { icon: SunIcon, datapoint: 'uvi_clear_sky' },
    wind_speed: { icon: WindIcon, datapoint: 'wind_speed' },
    precipitation_amount: { icon: DropletsIcon, datapoint: 'precipitation_amount' },
    pressure: { icon: GaugeIcon, datapoint: 'pressure' },
    relative_humidity: { icon: DropletIcon, datapoint: 'relative_humidity' },
  }

  const details = $derived<Details>(itemMap[item] ?? { datapoint: item })
</script>

{#if current?.[details.datapoint] !== undefined}
  <span class="inline-flex items-center gap-[0.375rem]">
    <details.icon />

    <FormattedMetric value={current[details.datapoint]} parameter={item} />

    {#if item === 'wind_speed' && current.wind_degrees}
      <Navigation2Icon
        class="text-text-muted size-[0.8em]!"
        style={`transform: rotate(${current.wind_degrees - 180}deg)`}
      />
    {/if}
  </span>
{/if}
