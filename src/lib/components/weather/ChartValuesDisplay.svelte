<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { TimeSeriesNumberEntry, ForecastParameter } from '$lib/types/data'
  import { slide } from 'svelte/transition'
  import ParameterValue from '$lib/components/ParameterValue.svelte'

  const settingsChart = settings.select((s) => s.sections.components.chart)

  interface Props {
    parameters: ForecastParameter[]
    highlightedTimeBucket: Record<ForecastParameter, TimeSeriesNumberEntry> | undefined
  }

  const { parameters, highlightedTimeBucket }: Props = $props()

  let timeBucket = $derived.by(() => {
    if ($settingsChart.tooltip) return null
    return highlightedTimeBucket ?? createEmptyTimeBucket()
  })

  function createEmptyTimeBucket() {
    let emptyTimeBucket: Record<ForecastParameter, undefined> = {} as any
    for (const key of parameters) {
      emptyTimeBucket[key] = undefined
    }
    return emptyTimeBucket
  }
</script>

{#if timeBucket !== null}
  <div class="flex w-full gap-2 text-sm" transition:slide>
    <div class="border-foreground flex min-h-9 w-fit items-center rounded-lg border-1 p-2">
      <span class="font-bold">{Object.values(timeBucket)[0]?.datetime.toFormat('HH:mm') ?? '--:--'}</span>
    </div>
    <div class="text-text border-foreground flex min-h-9 grow flex-row flex-wrap gap-4 rounded-lg border-1 px-2 py-1.5">
      {#each parameters as parameter (parameter)}
        <ParameterValue
          parameter={parameter as ForecastParameter}
          value={timeBucket?.[parameter]?.value}
          class="min-w-16"
        />
      {/each}
    </div>
  </div>
{/if}
