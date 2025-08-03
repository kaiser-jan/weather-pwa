<script lang="ts">
  import { ChevronRightIcon } from '@lucide/svelte'
  import type { ListSettingPage } from '../../types'

  interface Props {
    item: ListSettingPage
    value: Record<string, unknown>[]
    onchange: (v: unknown[]) => void
    onnavigate: (target: string[]) => void
  }

  let { item, value, onchange, onnavigate }: Props = $props()
</script>

<div class="flex w-full flex-col gap-2 py-1">
  {#each value as listItem, listIndex (listIndex)}
    <button
      class="bg-foreground flex w-full flex-row items-center gap-2 rounded-md px-3 py-2"
      onclick={() => {
        onnavigate([item.id, listIndex.toString()])
      }}
    >
      {#if item.nameProperty && item.nameProperty in listItem}
        {listItem[item.nameProperty]}
      {/if}
      <ChevronRightIcon class="ml-auto" />
    </button>
  {/each}
</div>
