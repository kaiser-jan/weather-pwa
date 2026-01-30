<script lang="ts">
  import { settings } from '$lib/stores/settings'
  import { forecastStore } from '$lib/stores/data'
  import NumberRangeBar from '$lib/components/visualization/NumberRangeBar.svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { dayView } from '$lib/stores/ui'
  import { Button } from '../ui/button'
  import { DateTime } from 'luxon'
  import { NOW_MILLIS, TODAY_MILLIS } from '$lib/stores/now'
  import { onMount } from 'svelte'
  import { BinocularsIcon, ChevronRightIcon, ChevronsRightIcon } from '@lucide/svelte'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'
  import WeatherChart from '../visualization/chart/WeatherChart.svelte'
  import { goto } from '$app/navigation'
  import FormattedMetric from '../snippets/FormattedMetric.svelte'

  let container = $state<HTMLDivElement>()

  const forecastStoreSubscription = forecastStore.subscribe(updateScroll)

  function updateScroll() {
    if (!container?.firstElementChild) return

    const scrollToToday = $settings.sections.outlook.scrollToToday
    const oldDays = $forecastStore?.daily.filter((d) => d.timestamp < $TODAY_MILLIS)
    const scrollPastCount = scrollToToday ? (oldDays?.length ?? 0) : 0
    container.scrollLeft = scrollPastCount * (container.firstElementChild as HTMLElement).offsetWidth
  }

  $effect(() => {
    const scrollToToday = $settings.sections.outlook.scrollToToday && $forecastStore?.daily
    if (scrollToToday || !scrollToToday) {
      updateScroll()
    }
  })

  onMount(() => {
    updateScroll()

    return () => {
      forecastStoreSubscription()
    }
  })
</script>

<SectionTitle title="Outlook" icon={ChevronsRightIcon} onclick={() => goto('/outlook')}>
  <ChevronRightIcon class="ml-auto" />
</SectionTitle>

{#if $settings.sections.outlook.showSummary}
  <FailSafeContainer name="Section Outlook" class="container flex flex-row overflow-y-auto " bind:element={container}>
    {#each $forecastStore?.daily.filter((d) => d.summary !== undefined && d.summary.temperature) ?? [] as day (day.timestamp)}
      <Button
        variant="ghost"
        size="fit"
        class={[
          'flex w-[calc(100%/7)] shrink-0 flex-col items-center justify-start gap-1 rounded-none border-foreground text-base not-last:border-r-2',
          day.timestamp < $TODAY_MILLIS ? 'opacity-40' : '',
        ]}
        onclick={() => dayView.open(day)}
      >
        <span>{DateTime.fromMillis(day.timestamp).toFormat('ccc')}</span>

        <FormattedMetric parameter="temperature" value={day.summary.temperature.max} class="text-text-muted" hideUnit />
        <NumberRangeBar
          total={$forecastStore?.total?.summary.temperature}
          instance={day.summary.temperature}
          details={METRIC_DETAILS.temperature}
          class="h-20 w-2"
          vertical
        />
        <FormattedMetric parameter="temperature" value={day.summary.temperature.min} class="text-text-muted" hideUnit />

        <!-- TODO: small bar to display intensity: for each category, color it and set the size to the percentage of time where preciptiation is in that range -->
        {#if $settings.sections.outlook.showPrecipitation && day.summary.precipitation_amount?.sum > $settings.data.forecast.precipitation.threshold}
          <FormattedMetric
            class="text-blue-200"
            parameter={'precipitation_amount'}
            value={day.summary.precipitation_amount.sum}
            accumulated
          />
        {/if}
      </Button>
    {:else}
      <Skeleton class="w-full h-32" />
    {/each}
  </FailSafeContainer>
{/if}

{#if $settings.sections.outlook.showChart}
  <FailSafeContainer name="Section Outlook Chart" class="container flex flex-col gap-2 overflow-y-auto">
    {#if $forecastStore}
      <!-- TODO: metrics setting -->
      <WeatherChart
        multiseries={$forecastStore.multiseries}
        parameters={$settings.sections.components.chart.plottedMetrics}
        startTimestamp={$TODAY_MILLIS}
        endTimestamp={$TODAY_MILLIS + 1000 * 3600 * 24 * 7}
        className="h-[max(20vh,12rem)]"
        location="overview"
        onclick={() => goto('/outlook')}
      />
    {/if}
  </FailSafeContainer>
{/if}
