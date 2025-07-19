<script lang="ts">
  import { ChevronRightIcon, GripHorizontalIcon, PencilIcon } from '@lucide/svelte'
  import { onMount } from 'svelte'
  import { dndzone, dragHandle, dragHandleZone } from 'svelte-dnd-action'

  interface Props {
    item: ListSetting
    value: Record<string, unknown>[]
    onchange: (v: unknown[]) => void
    onnavigate: (target: string) => void
  }

  let { item, value, onchange, onnavigate }: Props = $props()

  // HACK: vaul-svelte (drawer) and svelte-dnd-action have some weird conflict,
  // where dragging causes the SettingsView to scroll back a page
  // clicking the drawer first fixes it
  let div: HTMLDivElement
  onMount(() => {
    div.focus()
  })

  function clickCenter(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const options = { bubbles: true, cancelable: true, clientX: x, clientY: y }

    el.dispatchEvent(new MouseEvent('mousedown', options))
    el.dispatchEvent(new MouseEvent('mouseup', options))
    el.dispatchEvent(new MouseEvent('click', options))
  }
</script>

<div
  class="flex grow flex-col flex-nowrap gap-0 py-1"
  bind:this={div}
  data-vaul-no-drag
  use:dragHandleZone={{
    items: value,
    flipDurationMs: 300,
  }}
  onconsider={(e) => {
    value = e.detail.items
  }}
  onfinalize={(e) => {
    value = e.detail.items
    onchange(value)
  }}
>
  {#each value as listItem, listIndex (listItem.id)}
    <button
      class="bg-midground flex w-full flex-row items-center gap-2 px-3 py-2 not-last:border-b-2 first:rounded-t-md last:rounded-b-md"
      onclick={() => {
        onnavigate(listIndex.toString())
      }}
      data-vaul-no-drag
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div use:dragHandle onclick={(e) => e.stopPropagation()} data-vaul-no-drag>
        <GripHorizontalIcon data-vaul-no-drag />
      </div>
      {#if item.nameProperty && item.nameProperty in listItem}
        {listItem[item.nameProperty]}
      {/if}
      <ChevronRightIcon class="ml-auto" />
    </button>
  {/each}
</div>
