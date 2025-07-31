<script lang="ts">
  import { currentFromMultiseries } from '$lib/data/utils'
  import { forecastStore } from '$lib/stores/data'
  import { NOW_MILLIS, TODAY_MILLIS, TOMORROW_MILLIS } from '$lib/stores/now'
  import { autoFormatMetric, convertToUnit } from '$lib/utils/units'
  import { derived } from 'svelte/store'
  import NumberRangeBar from '../NumberRangeBar.svelte'
  import { settings } from '$lib/settings/store'
  import type { TimeBucket } from '$lib/types/data'
  import { DateTime } from 'luxon'

  const today = $derived($forecastStore?.daily?.find((d) => d.timestamp === $TODAY_MILLIS))
  const tomorrow = $derived($forecastStore?.daily?.find((d) => d.timestamp === $TOMORROW_MILLIS))

  const cmap = ['#5AAA5F', '#A7D25C', '#ECD347', '#F5BE41', '#F09235', '#D93322'] as const
  const labels = ['Very good', 'Good', 'Medium', 'Poor', 'Very Poor', 'Extremely Poor'] as const
  // const index_levels = [1, 2, 3, 4, 5, 6] as const

  const limits = {
    o3: [0, 50, 100, 130, 240, 380, 800],
    no2: [0, 40, 90, 120, 230, 340, 1000],
    // so2: [0, 100, 200, 350, 500, 750, 1250],
    pm25: [0, 20, 40, 50, 100, 150, 1200],
    pm10: [0, 10, 20, 25, 50, 75, 800],
  } as const

  type ForecastParameterAirPollution = keyof typeof limits

  function getLevel(value: number, scale: readonly number[]): number {
    for (let i = 0; i < scale.length - 1; i++) {
      const lower = scale[i]
      const upper = scale[i + 1]
      if (value < upper) {
        const t = (value - lower) / (upper - lower)
        return i + t
      }
    }
    return scale.length - 1
  }

  function getEaqiLevels(values: Partial<Record<ForecastParameterAirPollution, number | undefined>>) {
    const levels = {} as Record<ForecastParameterAirPollution, number>
    for (const key in limits) {
      const param = key as ForecastParameterAirPollution
      const value = values[param]
      if (value === null || value === undefined) return
      levels[param] = getLevel(convertToUnit(value, param, 'ug/m3'), limits[param])
    }
    return levels
  }

  function getEaqiIndex(levels: Record<string, number>): number {
    return Math.max(0, ...Object.values(levels))
  }

  function getEaqiDetailsForTimeBucket(day: TimeBucket) {
    const minValues = day ? Object.fromEntries(Object.entries(day.summary).map(([p, s]) => [p, s.min])) : {}
    const maxValues = day ? Object.fromEntries(Object.entries(day.summary).map(([p, s]) => [p, s.max])) : {}

    const maxLevels = getEaqiLevels(maxValues)
    const maxIndex = getEaqiIndex(maxLevels)

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
        index: currentLevels ? getEaqiIndex(currentLevels) : undefined,
      },
      today: today ? getEaqiDetailsForTimeBucket(today) : undefined,
      tomorrow: tomorrow ? getEaqiDetailsForTimeBucket(tomorrow) : undefined,
    }
  })
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
    <div class="flex flex-row items-center gap-2" class:opacity-70={type === 'tomorrow'}>
      <span class="text-text" class:font-bold={type === 'now'}>{label}</span>
      <div class="ml-auto size-3 rounded-full" style="background-color: {cmap[roundedIndex]}"></div>
      <!-- <span class="text-text-muted text-xs">{labels[roundedIndex]}</span> -->
      <span class="text-text-muted">{index.toFixed(1)}</span>
    </div>
  {/if}
{/snippet}

<div class="bg-midground flex flex-row gap-4 rounded-md px-3 py-2">
  {#if $eaqi && $eaqi.current.levels}
    <div class="flex grow flex-col justify-between gap-1">
      {@render eaqiIndex({ index: $eaqi.current.index, label: 'Now', type: 'now' })}
      {@render eaqiIndex({ index: $eaqi.today?.maxIndex, label: 'Today', type: 'today' })}
      {@render eaqiIndex({
        index: $eaqi.tomorrow?.maxIndex,
        label: DateTime.fromMillis($TOMORROW_MILLIS).toFormat('ccc'),
        type: 'tomorrow',
      })}
    </div>

    <span class="bg-overlay min-h-full w-0.5"></span>

    <div class="flex grow flex-col">
      {#each Object.keys($eaqi.current.levels) as _pollutant}
        {@const pollutant = _pollutant as ForecastParameterAirPollution}
        <div class="flex flex-row flex-nowrap items-center gap-2">
          <span class="w-16 text-sm font-medium">{pollutant.toUpperCase()}</span>
          <NumberRangeBar
            total={{ min: 0, max: limits[pollutant][4] * 1e-6 }}
            instance={{
              min: $eaqi.today?.minValues[pollutant],
              avg: $eaqi.current.values[pollutant],
              max: $eaqi.today?.maxValues[pollutant],
            }}
            color="bg-green-400"
            className="h-2"
          />
          <div class="text-muted-foreground w-20 text-right text-xs text-nowrap">
            {autoFormatMetric($eaqi.current.values[pollutant], pollutant, $settings) ?? '–'}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
