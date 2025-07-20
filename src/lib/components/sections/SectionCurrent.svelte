<script lang="ts">
  import { RefreshCwIcon } from '@lucide/svelte'
  import WeatherItemCurrent from '$lib/components/weather/WeatherItemCurrent.svelte'
  import { deriveWeatherSituationFromInstant } from '$lib/data/symbols'
  import WeatherSymbol from '$lib/components/weather/WeatherSymbol.svelte'
  import AsyncText from '$lib/components/AsyncText.svelte'
  import SkySimulation from '$lib/components/SkySimulation.svelte'
  import { currentFromMultiseries } from '$lib/data/utils'
  import { forecastStore, isForecastLoading } from '$lib/stores/data'
  import type { WeatherMetricKey } from '$lib/types/data'
  import { autoFormatMetric } from '$lib/utils/units'
  import { settings } from '$lib/settings/store'
  import { reverseGeocoding, placeToWeatherLocation } from '$lib/data/location'
  import { NOW } from '$lib/stores/now'
  import { coordinates } from '$lib/stores/location'

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

  const ITEMS_CURRENT: WeatherMetricKey[] = ['relative_humidity', 'wind_speed', 'pressure']

  const forecastCurrent = $derived.by(() => {
    if (!$forecastStore) return null
    if ($forecastStore.current) return $forecastStore.current
    return currentFromMultiseries($forecastStore.multiseries, $NOW)
  })
</script>

{#if $settingCurrentSticky}
  <div style={`height: calc(min(4rem, env(safe-area-inset-top)) + 25vh)`}></div>
{/if}

<div
  class={[
    'top-0 z-50 flex w-full flex-col items-center justify-center overflow-hidden rounded-b-[1rem] bg-blue-950 p-[0.5rem] transition-all',
    $settingCurrentSticky ? 'absolute' : 'relative',
  ]}
  style={`height: calc(min(4rem, env(safe-area-inset-top)) + ${shrink ? '10vh' : '25vh'})`}
>
  <SkySimulation class="absolute inset-0 z-0" coordinates={$coordinates} turbidity={4} datetime={$NOW} />

  <div class="shrink-0" style="height: env(safe-area-inset-top)"></div>

  <div
    class="text-text absolute top-[min(4rem,_env(safe-area-inset-top))] right-0 left-0 z-10 inline-flex w-full items-center justify-between p-1 text-xs"
  >
    {#await locationNamePromise then locationName}
      <span class="drop-shadow-c-md ml-1">{locationName}</span>
    {/await}
    <button onclick={() => forecastStore.update('manual')} class={['p-2', $isForecastLoading ? 'animate-spin' : '']}>
      <RefreshCwIcon />
    </button>
  </div>

  <div class={['z-10 flex flex-row items-center justify-center gap-4 transition-all', shrink ? 'mt-4' : 'mt-6']}>
    <div class={[shrink ? 'size-16' : 'size-30', 'relative z-10 grow-0 overflow-visible transition-all'].join(' ')}>
      <div
        class="from-background/20 absolute top-1/2 left-1/2 size-[150%] -translate-1/2 bg-radial to-transparent to-70%"
      ></div>
      <WeatherSymbol
        derived={deriveWeatherSituationFromInstant(forecastCurrent)}
        provided={forecastCurrent}
        coordinates={$coordinates}
        datetime={$NOW}
        className="absolute inset-0"
      />
    </div>
    <!-- TODO: units -->
    <AsyncText
      class={[shrink ? 'text-4xl' : 'text-6xl', 'drop-shadow-c-md transition-all'].join(' ')}
      text={autoFormatMetric(forecastCurrent?.temperature, 'temperature', $settings)}
      placeholder={'20°C'}
      loaded={forecastCurrent !== null}
    />
  </div>

  <div
    class="bg-background z-10 mt-auto flex h-10 w-full flex-row justify-between gap-4 overflow-hidden rounded-[0.5rem] px-3 py-2 transition-all"
    class:h-0!={shrink}
    class:p-0!={shrink}
    class:opacity-0={shrink}
  >
    {#each ITEMS_CURRENT as item}
      <WeatherItemCurrent {item} current={forecastCurrent} />
    {/each}
  </div>
</div>
