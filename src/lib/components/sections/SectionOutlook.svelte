<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { forecastStore } from '$lib/stores/data'
  import NumberRangeBar from '$lib/components/NumberRangeBar.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { dayView } from '$lib/stores/ui'
  import { Button } from '../ui/button'
  import { DateTime } from 'luxon'
  import { TODAY_MILLIS } from '$lib/stores/now'
  import { onMount } from 'svelte'
  import SectionTitle from './SectionTitle.svelte'
  import { BinocularsIcon } from '@lucide/svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'

  let container: HTMLDivElement

  const forecastStoreSubscription = forecastStore.subscribe(scrollToToday)

  function scrollToToday() {
    if (container?.firstElementChild) {
      // TODO: only if this is a past day
      container.scrollLeft = (container.firstElementChild as HTMLElement).offsetWidth
    }
  }

  onMount(() => {
    scrollToToday()

    return () => {
      forecastStoreSubscription()
    }
  })
</script>

<SectionTitle title="Outlook" icon={BinocularsIcon} />
<div class="flex flex-row overflow-y-auto rounded-md" bind:this={container}>
  {#each $forecastStore?.daily.filter((d) => d.summary !== undefined) ?? [] as day (day.timestamp)}
    <Button
      variant="midground"
      size="fit"
      class={[
        'border-foreground flex w-[calc(100%/7)] shrink-0 flex-col items-center justify-between gap-1 rounded-none p-1 text-base not-last:border-r-2',
        day.timestamp < $TODAY_MILLIS ? 'opacity-40' : '',
      ]}
      onclick={() => dayView.open(day)}
    >
      <span>{DateTime.fromMillis(day.timestamp).toFormat('ccc')}</span>

      <span class="text-text-muted">{Math.round(day.summary.temperature.max)}</span>
      <NumberRangeBar
        total={$forecastStore?.total?.summary.temperature}
        instance={day.summary.temperature}
        color={METRIC_DETAILS.temperature!.color}
        className="w-2 h-20"
        vertical
      />
      <span class="text-text-muted">{Math.round(day.summary.temperature.min)}</span>

      <!-- TODO: small bar to display intensity: for each category, color it and set the size to the percentage of time where preciptiation is in that range -->
      {#if $settings.sections.outlook.showPrecipitation}
        <span class="inline-flex items-baseline text-blue-200">
          <span>{Math.round(day.summary.precipitation_amount?.sum)}</span>
          <span class="text-text-disabled text-xs">mm</span>
        </span>
      {/if}
    </Button>
  {:else}
    <Skeleton class="w-full h-32" />
  {/each}
</div>
