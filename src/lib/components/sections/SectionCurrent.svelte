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

<div
  class="sticky top-0 z-50 flex w-full flex-col items-center justify-center overflow-hidden rounded-b-[1rem] bg-blue-950 p-[0.5rem] pt-0"
  class:h-[25vh]={!shrink}
  class:h-[10vh]={shrink}
>
  <SkySimulation class="absolute inset-0 z-0" coordinates={$coordinates} turbidity={4} datetime={$NOW} />

  <div class="shrink-0" style="height: max(0.5rem, env(safe-area-inset-top))"></div>

  <div class="text-text z-10 inline-flex w-full items-center justify-between text-xs">
    {#await locationNamePromise then locationName}
      <span class="drop-shadow-c-md">{locationName}</span>
    {/await}
    <button onclick={() => forecastStore.update()} class={['p-2', $isForecastLoading ? 'animate-spin' : '']}>
      <RefreshCwIcon />
    </button>
  </div>

  <div class="z-10 my-auto flex flex-row items-center justify-center gap-4">
    <WeatherSymbol
      className="size-30 z-10"
      derived={deriveWeatherSituationFromInstant(forecastCurrent)}
      provided={forecastCurrent}
      coordinates={$coordinates}
      datetime={$NOW}
    />
    <!-- TODO: units -->
    <AsyncText
      class="drop-shadow-c-md text-6xl"
      text={autoFormatMetric(forecastCurrent?.temperature, 'temperature', $settings)}
      placeholder={'20°C'}
      loaded={forecastCurrent !== null}
    />
  </div>

  <div class="bg-background z-10 flex h-10 w-full flex-row justify-between gap-4 rounded-[0.5rem] px-3 py-2">
    {#each ITEMS_CURRENT as item}
      <WeatherItemCurrent {item} current={forecastCurrent} />
    {/each}
  </div>
</div>
