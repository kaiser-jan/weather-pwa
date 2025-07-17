<script lang="ts">
  import type { Forecast, WeatherMetricKey } from '$lib/types/data'
  import { CloudIcon, DropletIcon, DropletsIcon, GaugeIcon, Navigation2Icon, SunIcon, WindIcon } from '@lucide/svelte'
  import MathFraction from '$lib/components/MathFraction.svelte'
  import { autoFormatMetric, getPreferredUnit } from '$lib/utils/units'
  import { settings } from '$lib/settings/store'

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

  const unit = $derived(getPreferredUnit(item, $settings))

  const formattedValue = $derived.by(() => {
    const rawValue = current?.[details.datapoint]!
    return autoFormatMetric(rawValue, item, $settings, { hideUnit: true })
  })
</script>

{#if current?.[details.datapoint] !== undefined}
  <span class="inline-flex items-center gap-[0.375rem]">
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <details.icon />

    <span class="inline-flex items-end gap-0.5">
      <span>{formattedValue}</span>
      {#if unit?.match(/\w\/\w/)}
        <MathFraction numerator={unit.split('/')[0]} denominator={unit.split('/')[1]} />
      {:else}
        <span class="text-text-muted mb-0.5 text-xs">{unit}</span>
      {/if}
    </span>

    {#if item === 'wind_speed' && current.wind_degrees}
      <Navigation2Icon
        class="text-text-muted size-[0.8em]!"
        style={`transform: rotate(${current.wind_degrees - 180}deg)`}
      />
    {/if}
  </span>
{/if}
