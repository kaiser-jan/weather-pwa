<script lang="ts">
  import { currentFromMultiseries } from '$lib/utils/forecast/current'
  import { forecastStore } from '$lib/stores/data'
  import { NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { autoFormatMetric } from '$lib/utils/units'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { settings } from '$lib/stores/settings'
  import type { TimeBucket } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import { FactoryIcon, InfoIcon } from '@lucide/svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import { EAQI } from '$lib/config/categorization'
  import { Button } from '../ui/button'
  import { dayView } from '$lib/stores/ui'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import { getEaqiLevels, type ForecastParameterAirPollution } from '$lib/utils/forecast/aqi/eaqi'
  import { colorToCss } from '$lib/utils/color'
  import FormattedMetric from '../snippets/FormattedMetric.svelte'

  const today = $derived($forecastStore?.daily?.find((d) => d.timestamp === $TODAY_MILLIS))
  const tomorrow = $derived($forecastStore?.daily?.find((d) => d.timestamp === $TOMORROW_MILLIS))

  function getEaqiDetailsForTimeBucket(day: TimeBucket) {
    const minValues = day ? Object.fromEntries(Object.entries(day.summary).map(([p, s]) => [p, s.min])) : {}
    const maxValues = day ? Object.fromEntries(Object.entries(day.summary).map(([p, s]) => [p, s.max])) : {}

    const maxLevels = getEaqiLevels(maxValues)
    const maxIndex = day.summary.aqi?.max

    return {
      minValues,
      maxValues,
      maxLevels,
      maxIndex,
    }
  }

  const eaqi = $derived.by(() => {
    if (!$forecastStore) return

    const currentValues = currentFromMultiseries($forecastStore.multiseries, $NOW_MILLIS)
    const currentLevels = getEaqiLevels(currentValues)

    return {
      current: {
        values: currentValues,
        levels: currentLevels,
        index: currentValues.aqi,
      },
      today: today ? getEaqiDetailsForTimeBucket(today) : undefined,
      tomorrow: tomorrow ? getEaqiDetailsForTimeBucket(tomorrow) : undefined,
    }
  })

  const pollutants = $derived(
    eaqi?.current.levels
      ? (Object.keys(eaqi.current.levels) as Array<keyof typeof EAQI.limits>)
      : new Array<keyof typeof EAQI.limits>(),
  )
</script>

{#snippet eaqiIndex({
  index,
  label,
  type,
}: {
  index: number | undefined
  label: string
  type: 'now' | 'today' | 'tomorrow'
})}
  {#if index}
    {@const roundedIndex = Math.max(Math.floor(index), 0)}
    <Button
      variant="ghost"
      size="fit"
      class={['flex grow flex-row items-center gap-2', type === 'tomorrow' ? 'opacity-70' : '']}
      onclick={() => dayView.open(type === 'tomorrow' ? tomorrow : today, ['aqi'])}
    >
      <span class="text-text" class:font-bold={type === 'now'}>{label}</span>
      <div class="ml-auto size-3 rounded-full" style="background-color: {colorToCss(EAQI.colors[roundedIndex])}"></div>
      {#if $settings.data.forecast.aqi.showCategory}
        <span class="w-[6ch] text-left text-xs text-text-muted">{EAQI.labels[roundedIndex]}</span>
      {:else}
        <span class="text-text-muted">{index.toFixed(1)}</span>
      {/if}
    </Button>
  {/if}
{/snippet}

<SectionTitle title="Air Pollution" icon={FactoryIcon}>
  <a
    class="ml-auto inline-flex items-center gap-1 text-sm"
    href="https://airindex.eea.europa.eu/AQI/index.html#"
    target="_blank"
  >
    <InfoIcon class="size-[1em]" /> EAQI
  </a>
</SectionTitle>
<FailSafeContainer name="Section Air Quality" class="container flex flex-row gap-4">
  {#if eaqi && eaqi.current.levels && eaqi.today}
    <div class="flex grow flex-col justify-between">
      {@render eaqiIndex({ index: eaqi.current.index, label: 'Now', type: 'now' })}
      {@render eaqiIndex({ index: eaqi.today?.maxIndex, label: 'Today', type: 'today' })}
      {@render eaqiIndex({
        index: eaqi.tomorrow?.maxIndex,
        label: DateTime.fromMillis($TOMORROW_MILLIS).toFormat('ccc'),
        type: 'tomorrow',
      })}
    </div>

    <span class="min-h-full w-0.5 bg-overlay"></span>

    <Button
      variant="ghost"
      size="fit"
      class="flex grow flex-col gap-0 text-left"
      onclick={() => dayView.open(today, [...pollutants, 'aqi'])}
    >
      {#each Object.keys(eaqi.current.levels) as _pollutant}
        {@const pollutant = _pollutant as ForecastParameterAirPollution}
        <div class="flex w-full flex-row flex-nowrap items-center gap-2">
          <span class="w-22 text-sm font-medium">{METRIC_DETAILS[pollutant]?.abbreviation}</span>
          <NumberRangeBar
            domain={{ min: 0, max: EAQI.limits[pollutant][Math.ceil(eaqi.today.maxIndex)] * 1e-6 }}
            instance={{
              min: eaqi.today.minValues[pollutant],
              avg: eaqi.current.values[pollutant]!,
              max: eaqi.today.maxValues[pollutant],
              sum: 0,
            }}
            details={METRIC_DETAILS[pollutant]!}
            class="h-2"
          />
          <FormattedMetric
            parameter={pollutant}
            value={eaqi.current.values[pollutant]}
            detailed
            class="w-20 text-right text-xs text-nowrap text-text-muted"
          />
        </div>
      {/each}
    </Button>
  {/if}
</FailSafeContainer>
