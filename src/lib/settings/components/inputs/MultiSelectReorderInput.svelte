<script lang="ts">
  import * as Popover from '$lib/components/ui/popover'
  import type { MultiSelectSetting } from '../../types'
  import { toReadable } from '$lib/utils/stores'
  import { GripHorizontalIcon, PlusIcon, Trash2Icon } from '@lucide/svelte'
  import { dragHandle, dragHandleZone } from 'svelte-dnd-action'
  import Label from '$lib/components/ui/label/label.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import { cn } from '$lib/utils'

  interface Props {
    item: MultiSelectSetting
    value: string[]
    onchange: (v: string[]) => void
  }

  let { item, value, onchange }: Props = $props()

  let disabled = toReadable(item.disabled)

  let items = $state(value.map((v) => ({ id: v })))

  $effect(() => {
    if (value) items = value.map((v) => ({ id: v }))
  })

  const options = $derived.by(() => {
    return item.options.filter((o) => !value.includes(o))
  })
</script>

<div
  class={cn('flex w-full flex-col gap-1', $disabled ? 'opacity-50' : '')}
  data-vaul-no-drag
  use:dragHandleZone={{
    items: items,
    flipDurationMs: 300,
    dragDisabled: $disabled,
    dropTargetStyle: {},
  }}
  onconsider={(e) => {
    items = e.detail.items
  }}
  onfinalize={(e) => {
    items = e.detail.items
    onchange(items.map((i) => i.id))
  }}
>
  {#each items as listItem, listIndex (listItem.id)}
    <div class="flex h-8 flex-row items-center gap-2" data-vaul-no-drag>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div use:dragHandle onclick={(e) => e.stopPropagation()} data-vaul-no-drag>
        <GripHorizontalIcon data-vaul-no-drag />
      </div>

      <Label for={listItem.id} class="leading-5">{item.labels?.[listItem.id] ?? listItem.id}</Label>

      <Button
        size="icon"
        variant="ghost"
        class="ml-auto"
        disabled={$disabled}
        onclick={() => {
          items.splice(listIndex, 1)
          onchange(items.map((i) => i.id))
        }}
      >
        <Trash2Icon />
      </Button>
    </div>
  {/each}
</div>

<Popover.Root>
  <Popover.Trigger>
    <Button class="h-8 min-h-6 px-3 py-2" variant="secondary" disabled={$disabled}>
      <PlusIcon />
      Select more
    </Button>
  </Popover.Trigger>
  <Popover.Content class="flex max-h-[50dvh] w-fit max-w-[90dvw] flex-col gap-1 overflow-y-scroll p-2">
    {#each options as option (option)}
      <Button
        variant="ghost"
        onclick={() => {
          items.push({ id: option })
          onchange(items.map((i) => i.id))
        }}
        class="justify-start px-3"
      >
        {option}
        <PlusIcon class="ml-auto" />
      </Button>
    {/each}
  </Popover.Content>
</Popover.Root>
