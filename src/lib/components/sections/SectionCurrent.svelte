<script lang="ts">
  import { RefreshCwIcon } from '@lucide/svelte'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { deriveWeatherSituationFromInstant } from '$lib/utils/symbols'
  import WeatherSymbol from '$lib/components/weather/WeatherSymbol.svelte'
  import AsyncText from '$lib/components/snippets/AsyncText.svelte'
  import SkySimulation from '$lib/components/visualization/sky/SkySimulation.svelte'
  import { forecastStore, loaderStates } from '$lib/stores/data'
  import type { ForecastParameter } from '$lib/types/data'
  import { autoFormatMetric } from '$lib/utils/units'
  import { settings } from '$lib/settings/store'
  import { reverseGeocoding, placeToWeatherLocation } from '$lib/utils/location'
  import { NOW, NOW_MILLIS } from '$lib/stores/now'
  import { coordinates } from '$lib/stores/location'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import { currentFromMultiseries } from '$lib/utils/forecast/current'
  import LoaderState from '../snippets/LoaderState.svelte'
  import { loaderSummaryState } from '$lib/utils/loaderState'

  interface Props {
    shrink: boolean
  }

  let { shrink }: Props = $props()

  const settingCurrentSticky = settings.select((s) => s.sections.current.sticky)

  let locationNamePromise = $derived.by(async () => {
    if (!$coordinates) return null
    const result = await reverseGeocoding($coordinates)
    const string = placeToWeatherLocation(result)
    return string
  })

  const ITEMS_CURRENT: ForecastParameter[] = ['dew_point', 'wind_speed', 'pressure']

  const forecastCurrent = $derived.by(() => {
    if (!$forecastStore) return null
    if ($forecastStore.current) return $forecastStore.current
    return currentFromMultiseries($forecastStore.multiseries, $NOW_MILLIS)
  })
</script>

{#if $settingCurrentSticky}
  <div style="height: calc(min(2rem, env(safe-area-inset-top)) + 25vh)"></div>
{/if}

<div
  class={[
    'bg-midground top-0 z-50 flex min-h-20 w-full flex-col overflow-hidden rounded-b-2xl p-2 transition-all',
    $settingCurrentSticky ? 'absolute' : 'relative',
  ]}
  style={`height: calc(min(2rem, env(safe-area-inset-top)) + ${shrink ? '10vh' : '25vh'})`}
>
  <SkySimulation class="absolute inset-0 z-0" coordinates={$coordinates} turbidity={4} datetime={$NOW} />
  <div class="shrink-0" style="height: min(2rem,env(safe-area-inset-top))"></div>

  <FailSafeContainer name="Section Current" class="relative shrink grow">
    <div class="text-text absolute inset-0 bottom-auto inline-flex w-full items-center justify-between text-xs">
      {#await locationNamePromise then locationName}
        <span class="drop-shadow-c-md ml-1 line-clamp-1">{locationName}</span>
      {/await}
      <button
        onclick={() => forecastStore.update('manual')}
        class={['p-2', $loaderStates.every((r) => r === null) ? 'animate-spin ' : '']}
      >
        <LoaderState state={$loaderSummaryState} class="text-text" />
      </button>
    </div>

    <div
      class="inset-0 flex h-full w-full flex-row items-center justify-center gap-4 transition-all"
      class:mt-1.5={shrink}
    >
      <div
        class={[shrink ? 'size-16' : 'size-30', 'relative shrink-0 grow-0 overflow-visible transition-all'].join(' ')}
      >
        <div
          class="from-background/20 absolute top-1/2 left-1/2 size-[150%] -translate-1/2 bg-radial to-transparent to-70%"
        ></div>
        <WeatherSymbol
          derived={forecastCurrent ? deriveWeatherSituationFromInstant(forecastCurrent) : null}
          coordinates={$coordinates}
          datetime={$NOW}
          className="absolute inset-0"
        />
      </div>
      <AsyncText
        class={[shrink ? 'text-4xl' : 'text-6xl', 'drop-shadow-c-md transition-all'].join(' ')}
        text={forecastCurrent?.temperature
          ? autoFormatMetric(forecastCurrent.temperature, 'temperature', $settings)
          : undefined}
        placeholder="20°C"
        loaded={forecastCurrent !== null}
      />
    </div>

    <div
      class="bg-background absolute inset-0 top-auto flex h-10 w-full shrink-0 flex-row justify-between gap-4 overflow-hidden rounded-lg px-3 py-2 transition-all"
      class:opacity-0={shrink}
      class:h-0!={shrink}
      class:p-0!={shrink}
    >
      {#each $settings.sections.current.metrics as item (item)}
        <WeatherItemCurrent {item} current={forecastCurrent} />
      {/each}
    </div>
  </FailSafeContainer>
</div>
