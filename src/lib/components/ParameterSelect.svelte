<script lang="ts">
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import * as Popover from '$lib/components/ui/popover'
  import { EllipsisIcon, EyeIcon, EyeOffIcon, PinIcon, PinOffIcon } from '@lucide/svelte'
  import { METRIC_DETAILS } from '$lib/config/metrics'
  import { type ForecastParameter, FORECAST_PARAMETERS } from '$lib/types/data'
  import { Button } from '$lib/components/ui/button'
  import { persistantState } from '$lib/utils/state.svelte'
  import { sortByReferenceOrder, toggle } from '$lib/utils'
  import IconOrAbbreviation from './IconOrAbbreviation.svelte'

  interface Props {
    visible: ForecastParameter[]
  }
  let { visible: visible = $bindable() }: Props = $props()

  // TODO: clean up on startup to ensure no old metrics are there which dont exist anymore
  let pinned = persistantState<ForecastParameter[]>('chart-parameters-pinned', [
    'cloud_coverage',
    'precipitation_amount',
    'temperature',
    'wind_speed',
  ])

  let temporary = $derived(visible.filter((p) => !pinned.value.includes(p)))

  function sortPinned() {
    pinned.value = sortByReferenceOrder(pinned.value, FORECAST_PARAMETERS)
  }
  function sortVisible() {
    visible = sortByReferenceOrder(visible, FORECAST_PARAMETERS)
  }
</script>

<div class="flex h-fit w-full flex-row gap-2">
  <ToggleGroup.Root type="multiple" variant="outline" bind:value={visible} class="h-fit grow">
    {#each pinned.value as parameter (parameter)}
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

  <Popover.Root>
    <Popover.Trigger>
      <Button size="icon" variant="secondary" class="size-9! border-1 p-2">
        <EllipsisIcon />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="flex w-fit flex-col gap-1 p-2">
      {#each Object.entries(METRIC_DETAILS) as [parameter, parameterDetails] (parameter)}
        {@const parameterTyped = parameter as ForecastParameter}
        {@const isActive = visible.includes(parameterTyped)}
        {@const isPinned = pinned.value.includes(parameterTyped)}
        <button
          class={[
            'flex flex-row items-center gap-2 rounded-md px-2 py-1',
            isActive ? 'text-text' : 'text-text-muted',
            // isActive ? 'bg-midground text-text' : 'text-text-muted',
          ]}
          onclick={() => {
            toggle(visible, parameter)
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
          <Button
            variant={isPinned ? 'secondary' : 'outline'}
            class="size-8 p-0"
            onclick={(e) => {
              e.stopPropagation()
              toggle(pinned.value, parameter)
              sortPinned()
            }}
          >
            {#if isPinned}
              <PinIcon class="text-text" />
            {:else}
              <PinOffIcon />
            {/if}
          </Button>
        </button>
      {/each}
    </Popover.Content>
  </Popover.Root>
</div>
