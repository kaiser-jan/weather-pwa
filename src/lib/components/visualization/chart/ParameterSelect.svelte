<script lang="ts">
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import * as Popover from '$lib/components/ui/popover'
  import {
    ChartSplineIcon,
    Edit2Icon,
    EllipsisIcon,
    EyeIcon,
    EyeOffIcon,
    PencilIcon,
    PinIcon,
    PinOffIcon,
  } from '@lucide/svelte'
  import { FORECAST_METRICS, METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'
  import { type ForecastParameter, FORECAST_PARAMETERS } from '$lib/types/data'
  import { Button } from '$lib/components/ui/button'
  import { sortByReferenceOrder, toggle } from '$lib/utils'
  import IconOrAbbreviation from '$lib/components/snippets/IconOrAbbreviation.svelte'
  import { persist } from '$lib/utils/stores'
  import { get } from 'svelte/store'
  import ExpandableList from '$lib/components/ExpandableList.svelte'
  import { settings } from '$lib/settings/store'
  import type { MetricDetails } from '$lib/types/ui'
  import { openSettingsAt } from '$lib/stores/ui'

  interface Props {
    visible: ForecastMetric[]
  }
  let { visible: visible = $bindable() }: Props = $props()

  let temporary = $derived(visible.filter((p) => !$settings.sections.components.chart.pinnedMetrics.includes(p)))

  let isOpen = $state(false)

  function sortVisible() {
    visible = sortByReferenceOrder(visible, FORECAST_METRICS)
  }
</script>

<div class="flex h-fit w-full flex-row gap-2">
  <ToggleGroup.Root type="multiple" variant="outline" bind:value={visible} class="h-fit grow">
    {#each $settings.sections.components.chart.pinnedMetrics as parameter (parameter)}
      {@const details = METRIC_DETAILS[parameter]!}
      <ToggleGroup.Item value={parameter} class="grow">
        <IconOrAbbreviation {details} />
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>

  {#if temporary.length}
    <ToggleGroup.Root type="multiple" variant="outline" bind:value={visible}>
      {#each temporary as parameter (parameter)}
        {@const details = METRIC_DETAILS[parameter]!}
        <ToggleGroup.Item value={parameter}>
          <IconOrAbbreviation {details} />
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  {/if}

  <Popover.Root bind:open={isOpen}>
    <Popover.Trigger>
      <Button size="icon" variant="secondary" class="size-9! border p-2">
        <EllipsisIcon />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="flex max-h-[50dvh] w-fit max-w-[90dvw] flex-col gap-1 p-2">
      <h2 class="inline-flex shrink-0 items-center gap-2 pl-2 text-base font-semibold">
        <ChartSplineIcon class="stroke-3" />
        Plotted Metrics
        <Button
          variant="ghost"
          size="icon"
          class="text-text-muted ml-auto p-0 text-sm"
          onclick={() => {
            isOpen = false
            openSettingsAt(['sections', 'components', 'chart'])
          }}
        >
          <PencilIcon />
        </Button>
      </h2>
      <ExpandableList
        items={Object.keys(METRIC_DETAILS) as ForecastParameter[]}
        visibleItems={$settings.data.forecast.metrics}
        markedItems={visible}
        triggerClass="p-2 min-h-0 mt-2"
      >
        {#snippet itemSnippet(metric: ForecastParameter)}
          <IconOrAbbreviation details={METRIC_DETAILS[metric]!} />
        {/snippet}

        {#snippet children(metrics: ForecastParameter[])}
          {#each metrics as metric (metric)}
            {@const parameterTyped = metric as ForecastMetric}
            {@const parameterDetails = METRIC_DETAILS[metric]!}
            {@const isActive = visible.includes(parameterTyped)}
            <Button
              variant="ghost"
              class={[
                'flex w-full grow flex-row items-center gap-2 rounded-md px-2 py-1',
                isActive ? 'text-text' : 'text-text-muted',
                // isActive ? 'bg-midground text-text' : 'text-text-muted',
              ]}
              onclick={() => {
                toggle(visible, metric)
                sortVisible()
              }}
            >
              <IconOrAbbreviation details={parameterDetails} />
              {parameterDetails.label}
              <span class="grow"></span>
              <Button variant={isActive ? 'secondary' : 'outline'} class="size-8 p-0">
                {#if isActive}
                  <EyeIcon />
                {:else}
                  <EyeOffIcon />
                {/if}
              </Button>
            </Button>
          {/each}
        {/snippet}
      </ExpandableList>
    </Popover.Content>
  </Popover.Root>
</div>
