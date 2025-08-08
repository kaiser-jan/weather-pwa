<script lang="ts">
  import { currentFromMultiseries } from '$lib/utils/forecast/current'
  import { forecastStore } from '$lib/stores/data'
  import { NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { autoFormatMetric, convertToUnit } from '$lib/utils/units'
  import { derived } from 'svelte/store'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { settings } from '$lib/settings/store'
  import type { TimeBucket } from '$lib/types/data'
  import { DateTime } from 'luxon'
  import { FactoryIcon, InfoIcon } from '@lucide/svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import { EAQI } from '$lib/config/categorization'
  import { hslFromObject } from '$lib/utils/ui'
  import { Button } from '../ui/button'
  import { dayView } from '$lib/stores/ui'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'

  const today = $derived($forecastStore?.daily?.find((d) => d.timestamp === $TODAY_MILLIS) ?? null)
  const tomorrow = $derived($forecastStore?.daily?.find((d) => d.timestamp === $TOMORROW_MILLIS) ?? null)

  type ForecastParameterAirPollution = keyof typeof EAQI.limits

  function getEaqiLevel(value: number, scale: readonly number[]): number {
    for (let i = 1; i < scale.length - 1; i++) {
      const lower = scale[i]
      const upper = scale[i + 1]
      if (value < upper) {
        const t = (value - lower) / (upper - lower)
        return i + 1 + t
      }
    }
    return scale.length - 1
  }

  function getEaqiLevels(values: Partial<Record<ForecastParameterAirPollution, number | undefined>>) {
    const levels = {} as Record<ForecastParameterAirPollution, number>
    for (const key in EAQI.limits) {
      const param = key as ForecastParameterAirPollution
      const value = values[param]
      if (value === null || value === undefined) return
      levels[param] = getEaqiLevel(convertToUnit(value, param, 'ug/m3'), EAQI.limits[param])
    }
    return levels
  }

  function getTotalEaqiIndex(levels: Record<string, number> | undefined): number {
    if (!levels) return
    return Math.max(0, ...Object.values(levels))
  }

  function getEaqiDetailsForTimeBucket(day: TimeBucket) {
    const minValues = day ? Object.fromEntries(Object.entries(day.summary).map(([p, s]) => [p, s.min])) : {}
    const maxValues = day ? Object.fromEntries(Object.entries(day.summary).map(([p, s]) => [p, s.max])) : {}

    const maxLevels = getEaqiLevels(maxValues)
    const maxIndex = getTotalEaqiIndex(maxLevels)

    return {
      minValues,
      maxValues,
      maxLevels,
      maxIndex,
    }
  }

  const eaqi = derived(forecastStore, ($f) => {
    if (!$f) return

    const currentValues = currentFromMultiseries($f.multiseries, $NOW_MILLIS)
    const currentLevels = getEaqiLevels(currentValues)

    return {
      current: {
        values: currentValues,
        levels: currentLevels,
        index: currentLevels ? getTotalEaqiIndex(currentLevels) : undefined,
      },
      today: today ? getEaqiDetailsForTimeBucket(today) : undefined,
      tomorrow: tomorrow ? getEaqiDetailsForTimeBucket(tomorrow) : undefined,
    }
  })

  const pollutants = $derived(
    $eaqi?.current.levels
      ? (Object.keys($eaqi.current.levels) as Array<keyof typeof EAQI.limits>)
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
    {@const roundedIndex = Math.max(Math.floor(index) - 1, 0)}
    <Button
      variant="ghost"
      size="fit"
      class={['flex grow flex-row items-center gap-2', type === 'tomorrow' ? 'opacity-70' : '']}
      onclick={() => dayView.open(type === 'tomorrow' ? tomorrow : today, pollutants)}
    >
      <span class="text-text" class:font-bold={type === 'now'}>{label}</span>
      <div
        class="ml-auto size-3 rounded-full"
        style="background-color: {hslFromObject(EAQI.colors[roundedIndex])}"
      ></div>
      <!-- <span class="text-text-muted text-xs">{EAQI.labels[roundedIndex]}</span> -->
      <span class="text-text-muted">{index.toFixed(1)}</span>
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
<FailSafeContainer name="Section Air Quality" class="bg-midground flex flex-row gap-4 rounded-md px-3 py-2">
  {#if $eaqi && $eaqi.current.levels}
    <div class="flex grow flex-col justify-between">
      {@render eaqiIndex({ index: $eaqi.current.index, label: 'Now', type: 'now' })}
      {@render eaqiIndex({ index: $eaqi.today?.maxIndex, label: 'Today', type: 'today' })}
      {@render eaqiIndex({
        index: $eaqi.tomorrow?.maxIndex,
        label: DateTime.fromMillis($TOMORROW_MILLIS).toFormat('ccc'),
        type: 'tomorrow',
      })}
    </div>

    <span class="bg-overlay min-h-full w-0.5"></span>

    <Button
      variant="midground"
      size="fit"
      class="flex grow flex-col gap-0 text-left"
      onclick={() => dayView.open(today, pollutants)}
    >
      {#each Object.keys($eaqi.current.levels) as _pollutant}
        {@const pollutant = _pollutant as ForecastParameterAirPollution}
        <div class="flex flex-row flex-nowrap items-center gap-2">
          <span class="w-22 text-sm font-medium">{METRIC_DETAILS[pollutant]?.abbreviation}</span>
          <NumberRangeBar
            total={{ min: 0, max: EAQI.limits[pollutant][Math.ceil($eaqi.today?.maxIndex) - 1] * 1e-6 }}
            instance={{
              min: $eaqi.today?.minValues[pollutant],
              avg: $eaqi.current.values[pollutant],
              max: $eaqi.today?.maxValues[pollutant],
            }}
            color={METRIC_DETAILS[pollutant]!.color}
            className="h-2"
          />
          <div class="text-muted-foreground w-20 text-right text-xs text-nowrap">
            {autoFormatMetric($eaqi.current.values[pollutant], pollutant, $settings) ?? '–'}
          </div>
        </div>
      {/each}
    </Button>
  {/if}
</FailSafeContainer>
