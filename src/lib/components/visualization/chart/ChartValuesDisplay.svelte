<script lang="ts">
  import type { TimeSeriesNumberEntry } from '$lib/types/data'
  import { slide } from 'svelte/transition'
  import ParameterValue from '$lib/components/snippets/ParameterValue.svelte'
  import { DateTime } from 'luxon'
  import { type ForecastMetric } from '$lib/config/metrics'

  interface Props {
    parameters: ForecastMetric[]
    highlightedTimeBucket: Record<ForecastMetric, TimeSeriesNumberEntry> | undefined
  }

  const { parameters, highlightedTimeBucket }: Props = $props()

  let timeBucket = $derived(highlightedTimeBucket ?? createEmptyTimeBucket())

  function createEmptyTimeBucket() {
    let emptyTimeBucket: Record<ForecastMetric, undefined> = {} as any
    for (const key of parameters) {
      emptyTimeBucket[key] = undefined
    }
    return emptyTimeBucket
  }

  const values = $derived(timeBucket ? Object.values(timeBucket) : [])
</script>

{#if timeBucket !== null}
  <div class="flex w-full gap-2 text-sm" transition:slide>
    <div class="flex min-h-9 w-fit items-center rounded-lg border border-foreground p-2">
      <span class="font-bold"
        >{values && values[0] ? DateTime.fromMillis(values[0]!.timestamp).toFormat('HH:mm') : '--:--'}</span
      >
    </div>
    <div class="flex min-h-9 grow flex-row flex-wrap gap-4 rounded-lg border border-foreground px-2 py-1.5 text-text">
      {#each parameters as parameter (parameter)}
        <ParameterValue
          parameter={parameter as ForecastMetric}
          value={timeBucket?.[parameter]?.value}
          class="min-w-16"
        />
      {/each}
    </div>
  </div>
{/if}
